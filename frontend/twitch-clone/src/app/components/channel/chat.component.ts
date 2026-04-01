import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  message: string;
  color: string;
  isMod: boolean;
  isVip: boolean;
  isSubscriber: boolean;
  isFirstChat: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col h-full bg-sidebar rounded-lg overflow-hidden border border-border">
      <!-- Chat Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <h3 class="font-semibold text-sm">Stream Chat</h3>
        <button class="p-1 rounded hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>

      <!-- Chat Messages -->
      <div class="flex-1 overflow-y-auto p-3 space-y-1">
        <!-- Pinned Message -->
        <div class="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-3">
          <div class="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <div>
              <p class="text-xs font-semibold text-primary mb-1">Pinned by streamer</p>
              <p class="text-sm text-foreground">Welcome to the stream! Don't forget to follow if you enjoy the content!</p>
            </div>
          </div>
        </div>

        @for (msg of messages; track msg.id) {
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
              <p class="text-sm text-foreground break-words">
                {{ msg.message }}
              </p>
            </div>
          </div>
        }
      </div>

      <!-- Chat Input -->
      <div class="p-3 border-t border-border bg-card">
        <div class="relative">
          <input 
            type="text" 
            [(ngModel)]="messageInput"
            placeholder="Send a message"
            class="w-full h-9 bg-secondary border border-input rounded-md pl-4 pr-20 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button class="p-1.5 rounded hover:bg-muted">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button class="p-1.5 rounded hover:bg-muted">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send</span>
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
export class ChatComponent {
  @Input() channelUsername = '';

  messageInput = '';

  messages: ChatMessage[] = [
    {
      id: '1',
      username: 'streamfan123',
      displayName: 'StreamFan123',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop',
      message: 'First time here, loving the stream!',
      color: '#FF4500',
      isMod: false,
      isVip: false,
      isSubscriber: false,
      isFirstChat: true,
      timestamp: new Date()
    },
    {
      id: '2',
      username: 'modmaster',
      displayName: 'ModMaster',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop',
      message: 'Welcome everyone! Remember to follow the channel!',
      color: '#00FF00',
      isMod: true,
      isVip: false,
      isSubscriber: true,
      isFirstChat: false,
      timestamp: new Date()
    },
    {
      id: '3',
      username: 'vipviewer',
      displayName: 'VIPViewer',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop',
      message: 'GG! That was insane gameplay',
      color: '#FFD700',
      isMod: false,
      isVip: true,
      isSubscriber: true,
      isFirstChat: false,
      timestamp: new Date()
    },
    {
      id: '4',
      username: 'newbie2024',
      displayName: 'Newbie2024',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=64&h=64&fit=crop',
      message: 'How do I become a subscriber?',
      color: '#8B5CF6',
      isMod: false,
      isVip: false,
      isSubscriber: false,
      isFirstChat: true,
      timestamp: new Date()
    },
    {
      id: '5',
      username: 'regularviewer',
      displayName: 'RegularViewer',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop',
      message: 'Been watching for 2 years now, best streamer!',
      color: '#FF69B4',
      isMod: false,
      isVip: false,
      isSubscriber: true,
      isFirstChat: false,
      timestamp: new Date()
    },
    {
      id: '6',
      username: 'hypecrew',
      displayName: 'HypeCrew',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop',
      message: 'LETS GOOOOOO!!!',
      color: '#FF0000',
      isMod: false,
      isVip: true,
      isSubscriber: false,
      isFirstChat: false,
      timestamp: new Date()
    }
  ];
}
