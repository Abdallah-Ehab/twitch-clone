export type StreamEventType = 'stream_started' | 'stream_ended' | 'viewer_count_updated';

export interface StreamEvent {
    type: StreamEventType;
    streamKey: string;
    channelId?: string;
    username?: string;
    viewerCount?: number;
    timestamp: string;
}

type SSEClient = {
    id: string;
    res: any;
};

class SSEManager {
    private clients: Map<string, SSEClient> = new Map();
    private clientIdCounter = 0;

    addClient(res: any): string {
        const clientId = `client_${++this.clientIdCounter}`;
        this.clients.set(clientId, { id: clientId, res });
        console.log(`[SSE] Client connected: ${clientId} (total: ${this.clients.size})`);
        return clientId;
    }

    removeClient(clientId: string): void {
        this.clients.delete(clientId);
        console.log(`[SSE] Client disconnected: ${clientId} (total: ${this.clients.size})`);
    }

    broadcast(event: StreamEvent): void {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        
        this.clients.forEach((client, clientId) => {
            try {
                client.res.write(data);
            } catch (err) {
                console.error(`[SSE] Error sending to client ${clientId}:`, err);
                this.removeClient(clientId);
            }
        });

        console.log(`[SSE] Broadcasted ${event.type} for stream ${event.streamKey} to ${this.clients.size} clients`);
    }

    getClientCount(): number {
        return this.clients.size;
    }
}

export const sseManager = new SSEManager();
export default sseManager;
