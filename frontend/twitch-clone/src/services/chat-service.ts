import { Injectable, signal, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth-service';
import { firstValueFrom } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class ChatService {
    private socket: Socket | null = null;
    private currentChannelId: string | null = null;

    messages = signal<ChatMessage[]>([]);
    viewerCount = signal<number>(0);
    isConnected = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    streamEnded = signal<boolean>(false);
    connectionError = signal<string | null>(null);

    private socketUrl = 'http://localhost:3000';

    constructor(private authService: AuthService) {}

    async connect(channelId: string) {
        if (this.socket?.connected && this.currentChannelId === channelId) return;

        this.disconnect();
        this.isLoading.set(true);
        this.connectionError.set(null);
        this.currentChannelId = channelId;

        // Refresh the token first — the interceptor doesn't cover socket connections
        try {
            const res: any = await firstValueFrom(this.authService.refreshToken());
            this.authService.setAccessToken(res.accessToken);
        } catch {
            this.isLoading.set(false);
            this.connectionError.set('Session expired. Please log in again.');
            return;
        }

        const token = this.authService.getAccessToken();
        if (!token) {
            this.isLoading.set(false);
            this.connectionError.set('Please log in to chat');
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
            this.connectionError.set(error.message || 'Failed to connect to chat');
        });

        this.socket.on('message_history', (data: { messages: ChatMessage[], viewerCount: number }) => {
            this.messages.set(data.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
            this.viewerCount.set(data.viewerCount);
            this.isLoading.set(false);
        });

        this.socket.on('new_message', (message: ChatMessage) => {
            this.messages.update(msgs => {
                const updated = [...msgs, { ...message, timestamp: new Date(message.timestamp) }];
                return updated.length > 100 ? updated.slice(-100) : updated;
            });
        });

        this.socket.on('viewer_count', (data: { viewerCount: number }) => {
            this.viewerCount.set(data.viewerCount);
        });

        this.socket.on('viewer_joined', (data: { username: string, viewerCount: number }) => {
            this.viewerCount.set(data.viewerCount);
        });

        this.socket.on('viewer_left', (data: { username: string, viewerCount: number }) => {
            this.viewerCount.set(data.viewerCount);
        });

        this.socket.on('stream_ended', () => {
            this.isConnected.set(false);
            this.streamEnded.set(true);
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
        this.streamEnded.set(false);
    }

    sendMessage(content: string) {
        if (!this.socket?.connected || !this.currentChannelId) return;
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
