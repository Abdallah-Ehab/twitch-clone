import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import Stream from '../models/stream.model.js';
import Channel from '../models/channel.model.js';
import userModel from '../models/user.model.js';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MAX_MESSAGES = 100;
class SocketService {
    io = null;
    activeStreams = new Map();
    initialize(server) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:4200',
                credentials: true
            },
            path: '/socket.io'
        });
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.query.token;
                if (!token) {
                    return next(new Error('Authentication required'));
                }
                const decoded = jwt.verify(token, JWT_SECRET);
                const user = await userModel.findById(decoded.userId).select('-password');
                if (!user) {
                    return next(new Error('User not found'));
                }
                socket.userId = user._id.toString();
                socket.username = user.username;
                socket.displayName = user.username;
                socket.avatarUrl = user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`;
                next();
            }
            catch (error) {
                next(new Error('Invalid token'));
            }
        });
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.username} (${socket.id})`);
            socket.on('join_channel', async (payload) => {
                await this.handleJoinChannel(socket, payload.channelId);
            });
            socket.on('leave_channel', (payload) => {
                this.handleLeaveChannel(socket, payload.channelId);
            });
            socket.on('send_message', async (payload) => {
                await this.handleSendMessage(socket, payload);
            });
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
                console.log(`User disconnected: ${socket.username}`);
            });
        });
        console.log('Socket.io server initialized');
        return this.io;
    }
    async handleJoinChannel(socket, channelId) {
        const channel = await Channel.findById(channelId);
        if (!channel)
            return;
        let streamData = this.activeStreams.get(channelId);
        if (!streamData) {
            const stream = await Stream.findOne({ channel: channelId });
            streamData = {
                messages: stream?.recentMessages || [],
                userSockets: new Map()
            };
            this.activeStreams.set(channelId, streamData);
        }
        streamData.userSockets.set(socket.id, socket);
        socket.join(`channel:${channelId}`);
        socket.emit('message_history', {
            messages: streamData.messages.slice(-MAX_MESSAGES),
            viewerCount: streamData.userSockets.size
        });
        socket.to(`channel:${channelId}`).emit('viewer_joined', {
            username: socket.username,
            viewerCount: streamData.userSockets.size
        });
        console.log(`${socket.username} joined channel ${channelId}. Viewers: ${streamData.userSockets.size}`);
    }
    handleLeaveChannel(socket, channelId) {
        const streamData = this.activeStreams.get(channelId);
        if (streamData) {
            streamData.userSockets.delete(socket.id);
            socket.leave(`channel:${channelId}`);
            socket.to(`channel:${channelId}`).emit('viewer_left', {
                username: socket.username,
                viewerCount: streamData.userSockets.size
            });
            console.log(`${socket.username} left channel ${channelId}. Viewers: ${streamData.userSockets.size}`);
        }
    }
    async handleSendMessage(socket, payload) {
        const { channelId, content } = payload;
        if (!content.trim())
            return;
        const streamData = this.activeStreams.get(channelId);
        if (!streamData)
            return;
        const message = {
            id: `${Date.now()}-${socket.id}`,
            userId: socket.userId,
            username: socket.username,
            displayName: socket.displayName,
            avatarUrl: socket.avatarUrl,
            content: content.trim(),
            color: this.getRandomColor(),
            isMod: false,
            isVip: false,
            isSubscriber: false,
            isFirstChat: this.isFirstChat(streamData.messages, socket.userId),
            timestamp: new Date()
        };
        streamData.messages.push(message);
        if (streamData.messages.length > MAX_MESSAGES) {
            streamData.messages = streamData.messages.slice(-MAX_MESSAGES);
        }
        this.io.to(`channel:${channelId}`).emit('new_message', message);
        await this.persistMessages(channelId);
    }
    async persistMessages(channelId) {
        try {
            const streamData = this.activeStreams.get(channelId);
            if (!streamData)
                return;
            await Stream.findOneAndUpdate({ channel: channelId }, {
                recentMessages: streamData.messages.slice(-MAX_MESSAGES),
                isLive: true,
                startedAt: streamData.messages.length > 0 ? streamData.messages[0].timestamp : new Date()
            }, { upsert: true });
        }
        catch (error) {
            console.error('Error persisting messages:', error);
        }
    }
    handleDisconnect(socket) {
        for (const [channelId, streamData] of this.activeStreams.entries()) {
            if (streamData.userSockets.has(socket.id)) {
                streamData.userSockets.delete(socket.id);
                this.io.to(`channel:${channelId}`).emit('viewer_left', {
                    username: socket.username,
                    viewerCount: streamData.userSockets.size
                });
                console.log(`${socket.username} disconnected from ${channelId}`);
            }
        }
    }
    isFirstChat(messages, userId) {
        return !messages.some(m => m.userId === userId);
    }
    getRandomColor() {
        const colors = [
            '#FF4500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
            '#85C1E9', '#F8B500', '#00CED1', '#FF69B4', '#32CD32'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    async startStream(channelId) {
        const stream = await Stream.findOneAndUpdate({ channel: channelId }, {
            isLive: true,
            startedAt: new Date(),
            endedAt: undefined,
            recentMessages: []
        }, { upsert: true, new: true });
        if (!this.activeStreams.has(channelId)) {
            this.activeStreams.set(channelId, {
                messages: [],
                userSockets: new Map()
            });
        }
        await Channel.findByIdAndUpdate(channelId, { isLive: true, viewerCount: 0 });
        return stream;
    }
    async endStream(channelId) {
        const streamData = this.activeStreams.get(channelId);
        if (streamData) {
            await Stream.findOneAndUpdate({ channel: channelId }, {
                isLive: false,
                endedAt: new Date(),
                recentMessages: streamData.messages.slice(-MAX_MESSAGES)
            });
            this.io.to(`channel:${channelId}`).emit('stream_ended', {
                channelId,
                endedAt: new Date()
            });
            for (const [, socket] of streamData.userSockets) {
                socket.leave(`channel:${channelId}`);
            }
            this.activeStreams.delete(channelId);
        }
        await Channel.findByIdAndUpdate(channelId, { isLive: false, viewerCount: 0 });
    }
    async updateViewerCount(channelId) {
        const streamData = this.activeStreams.get(channelId);
        if (!streamData)
            return 0;
        const viewerCount = streamData.userSockets.size;
        await Channel.findByIdAndUpdate(channelId, { viewerCount });
        this.io.to(`channel:${channelId}`).emit('viewer_count', { viewerCount });
        return viewerCount;
    }
    getIO() {
        return this.io;
    }
}
export const socketService = new SocketService();
export default socketService;
//# sourceMappingURL=socket.service.js.map