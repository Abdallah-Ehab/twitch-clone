import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { environment } from '../../environments/environment';

export type StreamEventType = 'stream_started' | 'stream_ended' | 'viewer_count_updated';

export interface StreamEvent {
    type: StreamEventType;
    streamKey: string;
    channelId?: string;
    username?: string;
    viewerCount?: number;
    timestamp: string;
}

export interface ChannelStreamState {
    channelId: string;
    streamKey: string;
    username?: string;
    isLive: boolean;
    viewerCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class StreamService implements OnDestroy {
    private eventSource: EventSource | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;
    
    private _channels = signal<Map<string, ChannelStreamState>>(new Map());
    private _connected = signal(false);
    
    channels = computed(() => Array.from(this._channels().values()));
    connected = this._connected.asReadonly();

    connect(): void {
        if (this.eventSource) {
            return;
        }

        const url = `${environment.apiUrl}/streams/events`;
        this.eventSource = new EventSource(url);

        this.eventSource.onopen = () => {
            console.log('[StreamService] SSE connected');
            this._connected.set(true);
            this.reconnectAttempts = 0;
        };

        this.eventSource.onmessage = (event) => {
            try {
                const data: StreamEvent = JSON.parse(event.data);
                this.handleStreamEvent(data);
            } catch (err) {
                console.error('[StreamService] Failed to parse SSE event:', err);
            }
        };

        this.eventSource.onerror = (err) => {
            console.error('[StreamService] SSE error:', err);
            this._connected.set(false);
            this.handleDisconnect();
        };
    }

    disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this._connected.set(false);
    }

    private handleStreamEvent(event: StreamEvent): void {
        const currentChannels = new Map(this._channels());

        switch (event.type) {
            case 'stream_started':
                currentChannels.set(event.streamKey, {
                    channelId: event.channelId || '',
                    streamKey: event.streamKey,
                    username: event.username,
                    isLive: true,
                    viewerCount: event.viewerCount || 0
                });
                break;

            case 'stream_ended':
                const existing = currentChannels.get(event.streamKey);
                if (existing) {
                    currentChannels.set(event.streamKey, {
                        ...existing,
                        isLive: false,
                        viewerCount: 0
                    });
                }
                break;

            case 'viewer_count_updated':
                const channel = currentChannels.get(event.streamKey);
                if (channel) {
                    currentChannels.set(event.streamKey, {
                        ...channel,
                        viewerCount: event.viewerCount ?? channel.viewerCount
                    });
                }
                break;
        }

        this._channels.set(currentChannels);
    }

    private handleDisconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[StreamService] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
                this.disconnect();
                this.connect();
            }, this.reconnectDelay);
        } else {
            console.log('[StreamService] Max reconnect attempts reached');
        }
    }

    getChannelState(streamKey: string): ChannelStreamState | undefined {
        return this._channels().get(streamKey);
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
