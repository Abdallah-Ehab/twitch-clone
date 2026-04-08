import { Injectable, signal, computed } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth-service';

export interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    content: string;
    color: string;
    isMod: boolean;
    isVip: boolean;
    isSubscriber: boolean;
    isFirstChat: boolean;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private socket: Socket | null = null;
    private currentChannelId: string | null = null;
    
    messages = signal<ChatMessage[]>([]);
    viewerCount = signal<number>(0);
    isConnected = signal<boolean>(false);
    isLoading = signal<boolean>(false);

    private socketUrl = 'http://localhost:3000';

    constructor(private authService: AuthService) {}

    connect(channelId: string) {
        if (this.socket?.connected && this.currentChannelId === channelId) {
            return;
        }

        this.disconnect();
        this.isLoading.set(true);
        this.currentChannelId = channelId;

        const token = this.authService.getAccessToken();
        if (!token) {
            console.warn('No auth token available for socket connection');
            this.isLoading.set(false);
            return;
        }

        this.socket = io(this.socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.isConnected.set(true);
            this.socket?.emit('join_channel', { channelId });
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.isConnected.set(false);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            this.isConnected.set(false);
            this.isLoading.set(false);
        });

        this.socket.on('message_history', (data: { messages: ChatMessage[], viewerCount: number }) => {
            this.messages.set(data.messages.map(m => ({
                ...m,
                timestamp: new Date(m.timestamp)
            })));
            this.viewerCount.set(data.viewerCount);
            this.isLoading.set(false);
        });

        this.socket.on('new_message', (message: ChatMessage) => {
            this.messages.update(msgs => {
                const updated = [...msgs, { ...message, timestamp: new Date(message.timestamp) }];
                if (updated.length > 100) {
                    return updated.slice(-100);
                }
                return updated;
            });
        });

        this.socket.on('viewer_count', (data: { viewerCount: number }) => {
            this.viewerCount.set(data.viewerCount);
        });

        this.socket.on('viewer_joined', (data: { username: string, viewerCount: number }) => {
            console.log(`${data.username} joined. Viewers: ${data.viewerCount}`);
            this.viewerCount.set(data.viewerCount);
        });

        this.socket.on('viewer_left', (data: { username: string, viewerCount: number }) => {
            console.log(`${data.username} left. Viewers: ${data.viewerCount}`);
            this.viewerCount.set(data.viewerCount);
        });

        this.socket.on('stream_ended', (data: { channelId: string, endedAt: Date }) => {
            console.log('Stream ended');
            this.messages.set([]);
            this.isConnected.set(false);
        });
    }

    disconnect() {
        if (this.currentChannelId && this.socket?.connected) {
            this.socket.emit('leave_channel', { channelId: this.currentChannelId });
        }
        
        this.socket?.disconnect();
        this.socket = null;
        this.currentChannelId = null;
        this.messages.set([]);
        this.viewerCount.set(0);
        this.isConnected.set(false);
    }

    sendMessage(content: string) {
        if (!this.socket?.connected || !this.currentChannelId) {
            console.warn('Cannot send message: not connected');
            return;
        }

        if (!content.trim()) return;

        this.socket.emit('send_message', {
            channelId: this.currentChannelId,
            content: content.trim()
        });
    }

    get isSocketConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}
