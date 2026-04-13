import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ChatService } from './chat-service';
import { AuthService } from './auth-service';

vi.mock('socket.io-client', () => {
    return {
        io: vi.fn(() => ({
            on: vi.fn(),
            emit: vi.fn(),
            disconnect: vi.fn(),
            connected: false,
        })),
        Socket: {},
    };
});

describe('ChatService', () => {
    let chatService: ChatService;
    let mockAuthService: { refreshToken: ReturnType<typeof vi.fn>; getAccessToken: ReturnType<typeof vi.fn>; setAccessToken: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        mockAuthService = {
            refreshToken: vi.fn().mockResolvedValue({ accessToken: 'mock-token' }),
            getAccessToken: vi.fn().mockReturnValue('mock-token'),
            setAccessToken: vi.fn(),
        };

        chatService = new ChatService(mockAuthService as unknown as AuthService);
    });

    afterEach(() => {
        chatService.disconnect();
    });

    it('should be created', () => {
        expect(chatService).toBeTruthy();
    });

    it('should initialize with default signals', () => {
        expect(chatService.messages()).toEqual([]);
        expect(chatService.viewerCount()).toBe(0);
        expect(chatService.isConnected()).toBe(false);
        expect(chatService.isLoading()).toBe(false);
        expect(chatService.streamEnded()).toBe(false);
        expect(chatService.connectionError()).toBeNull();
    });

    describe('connect', () => {
        it('should require authentication - connection fails when token refresh fails', async () => {
            mockAuthService.refreshToken.mockRejectedValueOnce(new Error('Session expired'));

            await chatService.connect('channel-123');

            expect(chatService.connectionError()).toBe('Session expired. Please log in again.');
            expect(chatService.isLoading()).toBe(false);
        });

        it('should refresh token before connecting to socket', async () => {
            await chatService.connect('channel-123');

            expect(mockAuthService.refreshToken).toHaveBeenCalled();
        });
    });

    describe('disconnect', () => {
        it('should reset all signals on disconnect', async () => {
            await chatService.connect('channel-123');

            chatService.disconnect();

            expect(chatService.messages()).toEqual([]);
            expect(chatService.viewerCount()).toBe(0);
            expect(chatService.isConnected()).toBe(false);
            expect(chatService.streamEnded()).toBe(false);
        });
    });

    describe('isSocketConnected', () => {
        it('should return false when socket is null', () => {
            expect(chatService.isSocketConnected).toBe(false);
        });
    });

    describe('authentication requirement for chat', () => {
        it('should start disconnected and with no errors', () => {
            expect(chatService.isConnected()).toBe(false);
            expect(chatService.connectionError()).toBeNull();
        });

        it('should require token refresh to connect', async () => {
            mockAuthService.refreshToken.mockResolvedValueOnce({ accessToken: 'fresh-token' });

            await chatService.connect('channel-123');

            expect(mockAuthService.refreshToken).toHaveBeenCalledTimes(1);
        });
    });
});
