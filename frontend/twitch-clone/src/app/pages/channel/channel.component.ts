import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../components/nav/header.component';
import { ChatComponent } from '../../components/channel/chat.component';
import { LiveBadgeComponent } from '../../components/shared/live-badge.component';
import { ChannelCardComponent } from '../../components/shared/channel-card.component';
import { ApiService, Channel } from '../../services/api.service';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [
    HeaderComponent,
    ChatComponent,
    LiveBadgeComponent,
    ChannelCardComponent,
  ],
  template: `
    <div class="min-h-screen bg-background">
      <app-header />
      
      @if (loading()) {
        <div class="flex items-center justify-center h-[calc(100vh-3.5rem)]">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      } @else if (error()) {
        <div class="flex items-center justify-center h-[calc(100vh-3.5rem)]">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-foreground mb-2">Channel not found</h2>
            <p class="text-muted-foreground mb-4">{{ error() }}</p>
            <a href="/" class="text-primary hover:underline">Go back home</a>
          </div>
        </div>
      } @else if (channel()) {
        <main class="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
          <!-- Main Content -->
          <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Video Player -->
            <div class="relative bg-black aspect-video lg:aspect-auto lg:flex-1">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p class="text-muted-foreground">{{ channel()!.isLive ? 'Live Stream' : 'Channel Offline' }}</p>
                  <p class="text-xs text-muted-foreground/60 mt-1">RTMP stream will be embedded here</p>
                </div>
              </div>

              <!-- Player Controls Overlay -->
              <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <button class="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                    <button class="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    </button>
                    <span class="text-white text-sm">{{ channel()!.bio || 'Stream Title' }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                    <button class="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stream Info -->
            <div class="border-t border-border bg-card p-4">
              <div class="flex flex-col md:flex-row md:items-start gap-4">
                <div class="flex items-center gap-3 flex-1">
                  <img 
                    [src]="channel()!.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop'" 
                    alt="Channel avatar" 
                    class="w-12 h-12 rounded-full object-cover bg-muted"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h1 class="font-bold text-lg">{{ channel()!.username }}</h1>
                      @if (channel()!.isLive) {
                        <app-live-badge />
                      }
                    </div>
                    <p class="text-sm text-muted-foreground truncate">{{ channel()!.bio || 'No description' }}</p>
                    @if (channel()!.isLive) {
                      <p class="text-xs text-muted-foreground mt-1">
                        {{ formatViewerCount(channel()!.viewerCount) }} viewers
                      </p>
                    }
                  </div>
                </div>

                <div class="flex items-center gap-2 flex-wrap">
                  <button (click)="toggleFollow()" class="gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                    </svg>
                    {{ isFollowing() ? 'Following' : 'Follow' }}
                  </button>
                  <button class="gap-2 px-4 py-2 bg-secondary hover:bg-muted rounded-md font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>

            <!-- Tabs -->
            <div class="flex-1 overflow-y-auto">
              <div class="border-b border-border">
                <div class="flex px-4 bg-card">
                  <button class="px-4 py-3 text-sm font-medium border-b-2 border-primary text-primary">Home</button>
                  <button class="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">Videos</button>
                  <button class="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">Followers</button>
                  <button class="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">About</button>
                </div>
              </div>

              <div class="p-4">
                <h3 class="font-semibold text-lg mb-4">Recommended Channels</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  @for (rec of recommendedChannels(); track rec.id) {
                    <app-channel-card 
                      [username]="rec.username"
                      [displayName]="rec.username"
                      [thumbnailUrl]="rec.thumbnailUrl || 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=640&h=360&fit=crop'"
                      [avatarUrl]="rec.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop'"
                      [category]="rec.bio || 'Variety'"
                      [isLive]="rec.isLive"
                      [viewerCount]="rec.viewerCount"
                    />
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Sidebar -->
          <aside class="w-full lg:w-80 xl:w-96 flex flex-col h-[500px] lg:h-auto border-t lg:border-t-0 lg:border-l border-border">
            <app-chat />
          </aside>
        </main>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class ChannelComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  
  channel = signal<Channel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  isFollowing = signal(false);
  recommendedChannels = signal<Channel[]>([]);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const username = params['username'];
      if (username) {
        this.loadChannel(username);
      }
    });
  }

  loadChannel(username: string) {
    this.loading.set(true);
    this.error.set(null);

    this.api.getChannelByUsername(username).subscribe({
      next: (channel) => {
        this.channel.set(channel);
        this.loading.set(false);
        this.loadRecommendedChannels();
      },
      error: (err) => {
        console.error('Failed to load channel:', err);
        this.error.set(err.error?.error || 'Failed to load channel');
        this.loading.set(false);
      }
    });
  }

  loadRecommendedChannels() {
    this.api.getChannels().subscribe({
      next: (channels) => {
        const currentUsername = this.channel()?.username;
        this.recommendedChannels.set(
          channels.filter(c => c.username !== currentUsername).slice(0, 6)
        );
      },
      error: () => {
        this.recommendedChannels.set([]);
      }
    });
  }

  toggleFollow() {
    const channelData = this.channel();
    if (!channelData) return;

    if (this.isFollowing()) {
      this.api.unfollowChannel(channelData.id).subscribe({
        next: () => this.isFollowing.set(false),
        error: () => console.error('Failed to unfollow')
      });
    } else {
      this.api.followChannel(channelData.id).subscribe({
        next: () => this.isFollowing.set(true),
        error: () => console.error('Failed to follow')
      });
    }
  }

  formatViewerCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }
}
