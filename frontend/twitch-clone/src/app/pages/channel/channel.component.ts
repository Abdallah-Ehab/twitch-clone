import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../components/nav/header.component';
import { ChatComponent } from '../../components/channel/chat.component';
import { LiveBadgeComponent } from '../../components/shared/live-badge.component';
import { ChannelCardComponent } from '../../components/shared/channel-card.component';
import { VideoPlayerComponent } from '../../components/channel/video-player.component';
import { ApiService, Channel } from '../../services/api.service';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [
    HeaderComponent,
    ChatComponent,
    LiveBadgeComponent,
    ChannelCardComponent,
    VideoPlayerComponent,
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
            <div class="relative bg-black w-full" [class.aspect-video]="!isFullscreen" [class.h-full]="isFullscreen">
              @if (channel()!.isLive && channel()!.hlsUrl) {
                <app-video-player
                  [src]="channel()!.hlsUrl || ''"
                  [posterUrl]="channel()!.thumbnailUrl || channel()!.bannerUrl || ''"
                  [isLive]="true"
                  [qualities]="channel()!.qualities || ['auto', '1080p', '720p', '480p', '360p']"
                />
              } @else {
                <!-- Offline State -->
                <div class="w-full aspect-video bg-black flex items-center justify-center">
                  <div class="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 text-muted-foreground mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p class="text-xl text-muted-foreground mb-2">Channel Offline</p>
                    <p class="text-sm text-muted-foreground/60">{{ channel()!.username }} is not currently streaming</p>
                  </div>
                </div>
              }
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
                  <button (click)="shareChannel()" class="gap-2 px-4 py-2 bg-secondary hover:bg-muted rounded-md font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>

              <!-- Tags -->
              @if (channel()!.tags && channel()!.tags!.length > 0) {
                <div class="flex gap-2 mt-4 flex-wrap">
                  @for (tag of channel()!.tags; track tag) {
                    <span class="px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">{{ tag }}</span>
                  }
                </div>
              }
            </div>

            <!-- Tabs -->
            <div class="flex-1 overflow-y-auto">
              <div class="border-b border-border">
                <div class="flex px-4 bg-card">
                  <button
                    class="px-4 py-3 text-sm font-medium border-b-2"
                    [class.border-primary]="activeTab() === 'home'"
                    [class.text-primary]="activeTab() === 'home'"
                    [class.text-muted-foreground]="activeTab() !== 'home'"
                    (click)="activeTab.set('home')"
                  >Home</button>
                  <button
                    class="px-4 py-3 text-sm font-medium border-b-2 border-transparent"
                    [class.border-primary]="activeTab() === 'videos'"
                    [class.text-primary]="activeTab() === 'videos'"
                    [class.text-muted-foreground]="activeTab() !== 'videos'"
                    (click)="activeTab.set('videos')"
                  >Videos</button>
                  <button
                    class="px-4 py-3 text-sm font-medium border-b-2 border-transparent"
                    [class.border-primary]="activeTab() === 'followers'"
                    [class.text-primary]="activeTab() === 'followers'"
                    [class.text-muted-foreground]="activeTab() !== 'followers'"
                    (click)="activeTab.set('followers')"
                  >Followers</button>
                  <button
                    class="px-4 py-3 text-sm font-medium border-b-2 border-transparent"
                    [class.border-primary]="activeTab() === 'about'"
                    [class.text-primary]="activeTab() === 'about'"
                    [class.text-muted-foreground]="activeTab() !== 'about'"
                    (click)="activeTab.set('about')"
                  >About</button>
                </div>
              </div>

              <div class="p-4">
                @switch (activeTab()) {
                  @case ('home') {
                    <h3 class="font-semibold text-lg mb-4">Recommended Channels</h3>
                    @if (recommendedChannels().length > 0) {
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
                    } @else {
                      <p class="text-muted-foreground">No other channels are currently live.</p>
                    }
                  }
                  @case ('videos') {
                    <h3 class="font-semibold text-lg mb-4">Past Broadcasts</h3>
                    <p class="text-muted-foreground">No past broadcasts available.</p>
                  }
                  @case ('followers') {
                    <h3 class="font-semibold text-lg mb-4">Followers</h3>
                    <p class="text-muted-foreground">Follower count coming soon.</p>
                  }
                  @case ('about') {
                    <h3 class="font-semibold text-lg mb-4">About {{ channel()!.username }}</h3>
                    <p class="text-muted-foreground mb-4">{{ channel()!.bio || 'This channel has no description.' }}</p>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p class="text-muted-foreground">Stream URL</p>
                        <p class="font-medium text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">{{ channel()!.streamUrl }}</p>
                      </div>
                      @if (channel()!.isLive) {
                        <div>
                          <p class="text-muted-foreground">Playback URL</p>
                          <p class="font-medium text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">{{ channel()!.hlsUrl }}</p>
                        </div>
                      }
                    </div>
                  }
                }
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
  activeTab = signal<'home' | 'videos' | 'followers' | 'about'>('home');
  isFullscreen = false;

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

  shareChannel() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${this.channel()?.username}'s Channel`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  }

  onFullscreenChange(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
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
