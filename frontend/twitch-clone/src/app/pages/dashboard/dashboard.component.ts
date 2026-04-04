import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, Channel } from '../../services/api.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
  ],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    } @else if (error()) {
      <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8">
        <p class="text-destructive">{{ error() }}</p>
      </div>
    } @else {
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-foreground">Creator Dashboard</h1>
        <p class="text-muted-foreground">Manage your stream and channel settings</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-card border border-border rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-muted-foreground">Followers</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p class="text-2xl font-bold text-foreground">0</p>
          <p class="text-xs text-green-500 mt-1">Build your audience</p>
        </div>

        <div class="bg-card border border-border rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-muted-foreground">Avg. Viewers</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p class="text-2xl font-bold text-foreground">{{ myChannel()?.viewerCount || 0 }}</p>
          @if (myChannel()?.isLive) {
            <p class="text-xs text-red-500 mt-1">Currently live!</p>
          } @else {
            <p class="text-xs text-muted-foreground mt-1">Go live to get viewers</p>
          }
        </div>

        <div class="bg-card border border-border rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-muted-foreground">Peak Viewers</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p class="text-2xl font-bold text-foreground">0</p>
          <p class="text-xs text-muted-foreground mt-1">Start streaming</p>
        </div>

        <div class="bg-card border border-border rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-muted-foreground">Stream Status</span>
            <div class="w-3 h-3 rounded-full" [class.bg-red-500]="myChannel()?.isLive" [class.bg-gray-400]="!myChannel()?.isLive"></div>
          </div>
          <p class="text-2xl font-bold text-foreground">{{ myChannel()?.isLive ? 'LIVE' : 'OFFLINE' }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ myChannel()?.isLive ? 'Streaming now' : 'Not broadcasting' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-card border border-border rounded-lg p-4">
            <h3 class="font-semibold mb-4">Stream Preview</h3>
            <div class="aspect-video bg-black rounded-lg flex items-center justify-center">
              <div class="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-muted-foreground mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                @if (myChannel()?.isLive) {
                  <p class="text-red-500 font-medium">You're currently streaming!</p>
                  <a [href]="'/channel/' + currentUser()?.username" class="text-primary hover:underline text-sm mt-2 block">View your channel</a>
                } @else {
                  <p class="text-muted-foreground text-sm">Start streaming to see preview</p>
                }
              </div>
            </div>
          </div>

          <div class="bg-card border border-border rounded-lg p-4">
            <h3 class="font-semibold mb-4">Channel Settings</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-1.5">Bio / Stream Description</label>
                <textarea
                  [(ngModel)]="bio"
                  placeholder="Tell viewers about your stream..."
                  rows="3"
                  class="w-full px-4 py-2 bg-secondary border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-foreground mb-1.5">Avatar URL</label>
                <input
                  [(ngModel)]="avatarUrl"
                  type="text"
                  placeholder="https://example.com/avatar.jpg"
                  class="w-full h-10 px-4 bg-secondary border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-foreground mb-1.5">Banner URL</label>
                <input
                  [(ngModel)]="bannerUrl"
                  type="text"
                  placeholder="https://example.com/banner.jpg"
                  class="w-full h-10 px-4 bg-secondary border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <button
                (click)="saveSettings()"
                [disabled]="saving()"
                class="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                @if (saving()) {
                  Saving...
                } @else {
                  Save Changes
                }
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-card border border-border rounded-lg p-4">
            <div class="text-center mb-4">
              <div class="inline-flex items-center gap-2 mb-2">
                <span class="w-3 h-3 rounded-full" [class.bg-red-500]="myChannel()?.isLive" [class.animate-pulse]="myChannel()?.isLive" [class.bg-gray-400]="!myChannel()?.isLive"></span>
                <span class="text-sm font-medium" [class.text-red-500]="myChannel()?.isLive" [class.text-muted-foreground]="!myChannel()?.isLive">
                  {{ myChannel()?.isLive ? 'LIVE' : 'OFFLINE' }}
                </span>
              </div>
              @if (myChannel()?.isLive) {
                <p class="text-sm text-muted-foreground">{{ myChannel()?.viewerCount }} watching</p>
              } @else {
                <p class="text-sm text-muted-foreground">Start streaming to go live</p>
              }
            </div>

            @if (!myChannel()?.isLive) {
              <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                <p class="text-xs text-yellow-600 dark:text-yellow-400">
                  <strong>How to start streaming:</strong><br/>
                  1. Open OBS or Streamlabs<br/>
                  2. Set Server to: <code class="bg-black/20 px-1 rounded">rtmp://localhost:1935</code><br/>
                  3. Set Stream Key to your key below<br/>
                  4. Click "Start Streaming"
                </p>
              </div>
            }
          </div>

          <div class="bg-card border border-border rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">Stream Key</h3>
              <button
                (click)="toggleKeyVisibility()"
                class="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                @if (showKey()) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057 5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                }
              </button>
            </div>

            <div class="relative mb-3">
              <input
                [type]="showKey() ? 'text' : 'password'"
                [value]="myChannel()?.streamUrl || ''"
                readonly
                class="w-full h-10 px-4 pr-12 bg-secondary border border-input rounded-md text-sm font-mono"
              />
              <button
                (click)="copyKey()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title="Copy to clipboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            <p class="text-xs text-muted-foreground mb-2">Use this key in OBS or Streamlabs to stream</p>
            <button class="w-full text-sm text-primary hover:underline">Reset Stream Key</button>
          </div>

          <div class="bg-card border border-border rounded-lg p-4">
            <h3 class="font-semibold mb-4">Stream URLs</h3>

            <div class="space-y-3 text-sm">
              <div>
                <p class="text-muted-foreground mb-1">RTMP Server</p>
                <code class="block bg-secondary p-2 rounded text-xs break-all">rtmp://localhost:1935/live/&#123;streamKey&#125;</code>
              </div>
              <div>
                <p class="text-muted-foreground mb-1">HLS Playback</p>
                <code class="block bg-secondary p-2 rounded text-xs break-all">http://localhost:8000/live/&#123;streamKey&#125;/stream.m3u8</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  userService = inject(UserService);

  myChannel = signal<Channel | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  showKey = signal(false);

  currentUser = this.userService.currentUser;

  bio = '';
  avatarUrl = '';
  bannerUrl = '';

  ngOnInit() {
    this.loadMyChannel();
  }

  loadMyChannel() {
    this.loading.set(true);
    this.error.set(null);

    this.api.getMyChannel().subscribe({
      next: (channel) => {
        this.myChannel.set(channel);
        this.bio = channel.bio || '';
        this.avatarUrl = channel.avatarUrl || '';
        this.bannerUrl = channel.bannerUrl || '';
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load channel:', err);
        this.error.set(err.error?.error || 'Failed to load your channel');
        this.loading.set(false);
      }
    });
  }

  toggleKeyVisibility() {
    this.showKey.update(v => !v);
  }

  copyKey() {
    const key = this.myChannel()?.streamUrl;
    if (key) {
      navigator.clipboard.writeText(key);
      alert('Stream URL copied to clipboard!');
    }
  }

  saveSettings() {
    const channel = this.myChannel();
    if (!channel) return;

    this.saving.set(true);
    this.error.set(null);

    this.api.updateChannel(channel.id, {
      bio: this.bio,
      avatarUrl: this.avatarUrl,
      bannerUrl: this.bannerUrl
    }).subscribe({
      next: (updatedChannel) => {
        this.saving.set(false);
        this.myChannel.set({
          ...channel,
          bio: this.bio,
          avatarUrl: this.avatarUrl,
          bannerUrl: this.bannerUrl
        });
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.error || 'Failed to save settings');
      }
    });
  }
}
