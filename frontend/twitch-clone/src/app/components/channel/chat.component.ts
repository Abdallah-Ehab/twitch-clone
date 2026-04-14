import { Component, Input, OnInit, OnDestroy, inject, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../../services/chat-service';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col h-full bg-sidebar rounded-lg overflow-hidden border border-border">
      <!-- Chat Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold text-sm">Stream Chat</h3>
          @if (chatService.isConnected()) {
            <span class="w-2 h-2 rounded-full bg-green-500"></span>
          } @else {
            <span class="w-2 h-2 rounded-full bg-gray-500"></span>
          }
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground">{{ chatService.viewerCount() }} viewers</span>
          <button class="p-1 rounded hover:bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Chat Messages -->
      <div class="flex-1 overflow-y-auto p-3 space-y-1" #chatContainer>
        <!-- Stream Ended Banner -->
        @if (chatService.streamEnded()) {
          <div class="p-3 rounded-lg bg-muted border border-border mb-3">
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Stream has ended</span>
            </div>
          </div>
        }

        @if (chatService.isLoading()) {
          <div class="flex items-center justify-center h-full">
            <div class="animate-pulse text-muted-foreground text-sm">Loading chat...</div>
          </div>
        } @else if (!chatService.isConnected() && channelUsername) {
          <div class="flex flex-col items-center justify-center h-full text-center p-4">
            @if (chatService.connectionError()) {
              <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-3 max-w-[200px]">
                <p class="text-red-400 text-xs">{{ chatService.connectionError() }}</p>
              </div>
            }
            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-muted-foreground mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-muted-foreground text-sm">Connect to watch the chat</p>
            <button
              (click)="connectToChat()"
              class="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              Join Chat
            </button>
          </div>
        } @else {
          @for (msg of chatService.messages(); track msg.id) {
            <div class="group flex gap-2 p-1.5 rounded hover:bg-muted/50">
              <!-- Avatar -->
              <img
                [src]="msg.avatarUrl"
                [alt]="msg.username"
                class="w-8 h-8 rounded-full flex-shrink-0 object-cover bg-muted"
              />

              <!-- Message Content -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                  <!-- Username -->
                  <span class="text-sm font-semibold" [style.color]="msg.color">
                    {{ msg.displayName }}
                  </span>

                  <!-- Badges -->
                  @if (msg.isMod) {
                    <span class="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-bold bg-green-600 text-white">
                      MOD
                    </span>
                  }
                  @if (msg.isVip) {
                    <span class="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">
                      VIP
                    </span>
                  }
                  @if (msg.isSubscriber) {
                    <span class="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white">
                      SUB
                    </span>
                  }
                  @if (msg.isFirstChat) {
                    <span class="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground">
                      NEW
                    </span>
                  }
                </div>

                <!-- Message Text -->
                <p class="text-sm text-foreground break-words" [innerHTML]="renderMessage(msg.content)"></p>
              </div>
            </div>
          }
        }
      </div>

      <!-- Chat Input -->
      <div class="p-3 border-t border-border bg-card">
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="messageInput"
            [disabled]="!chatService.isConnected() || chatService.streamEnded()"
            (keyup.enter)="sendMessage()"
            placeholder="{{ getInputPlaceholder() }}"
            class="w-full h-9 bg-secondary border border-input rounded-md pl-4 pr-20 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <div class="relative">
              <button 
                (click)="toggleEmojiPicker()"
                class="p-1.5 rounded hover:bg-muted" 
                [disabled]="!chatService.isConnected() || chatService.streamEnded()"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              @if (showEmojiPicker()) {
                <div class="absolute bottom-full right-0 mb-2 p-2 bg-background border border-border rounded-lg shadow-lg grid grid-cols-6 gap-1 w-52">
                  @for (emoji of emojis; track emoji) {
                    <button 
                      (click)="addEmoji(emoji)"
                      class="p-1.5 text-lg hover:bg-muted rounded cursor-pointer"
                    >
                      {{ emoji }}
                    </button>
                  }
                </div>
              }
            </div>
            <button class="p-1.5 rounded hover:bg-muted" [disabled]="!chatService.isConnected() || chatService.streamEnded()">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{{ chatService.streamEnded() ? 'Chat is closed' : 'Press Enter to send' }}</span>
          <span>{{ messageInput.length }}/500</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() channelUsername = '';
  @Input() channelId = '';

  chatService = inject(ChatService);
  private authService = inject(AuthService);

  messageInput = '';
  showEmojiPicker = signal(false);
  
  emojis = ['😂', '❤️', '👀', '🔥', 'GG', '!!1', '🎮', '💀', '😭', '🤣', '😍', '🤔', '👍', '👎', '🙌', '😎', '🥳', '😱', '🤯', '💯', '✨', '🎉', '😢', '😤'];

  constructor() {
    effect(() => {
      const messages = this.chatService.messages();
      if (messages.length > 0) {
        this.scrollToBottom();
      }
    });
  }

  ngOnInit() {
    if (this.channelId) {
      this.connectToChat();
    }
  }

  ngOnDestroy() {
    this.chatService.disconnect();
  }

   connectToChat() {
        if (this.channelId && this.authService.getAccessToken()) {
            this.chatService.connect(this.channelId);
        }
    }

  sendMessage() {
    if (!this.messageInput.trim()) return;

    this.chatService.sendMessage(this.messageInput);
    this.messageInput = '';
  }

  toggleEmojiPicker() {
    this.showEmojiPicker.update(v => !v);
  }

  addEmoji(emoji: string) {
    this.messageInput += emoji;
    this.showEmojiPicker.set(false);
  }

  renderMessage(content: string): string {
    return content.replace(/:(\w+):/g, (match, name) => {
      const emojiMap: { [key: string]: string } = {
        'smile': '😊', 'laughing': '😂', 'heart': '❤️', 'fire': '🔥',
        'eyes': '👀', 'skull': '💀', 'joy': '😭', 'thinking': '🤔',
        'thumbsup': '👍', 'thumbsdown': '👎', 'pray': '🙌', 'cool': '😎',
        'party': '🥳', 'scream': '😱', '100': '💯', 'sparkles': '✨',
        'tada': '🎉', 'sob': '😢', 'angry': '😤', 'game': '🎮'
      };
      return emojiMap[name.toLowerCase()] || match;
    });
  }

  getInputPlaceholder(): string {
    if (this.chatService.streamEnded()) {
      return 'Chat is closed';
    }
    if (this.chatService.isConnected()) {
      return 'Send a message';
    }
    return 'Join chat to send messages';
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.flex-1.overflow-y-auto');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
  }
}
