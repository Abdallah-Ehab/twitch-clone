import { Component, OnInit, signal } from '@angular/core';
import { ChannelCardComponent } from '../../components/shared/channel-card.component';
import { ChannelService, Channel } from '../../services/channel.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ChannelCardComponent,
  ],
  template: `
    <section class="mb-8">
      <div class="rounded-xl bg-gradient-to-r from-purple-900/50 to-primary/20 p-8">
        <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Welcome to StreamHub
        </h1>
        <p class="text-muted-foreground text-lg">
          Discover live streams, connect with creators, and join a community of gamers.
        </p>
      </div>
    </section>

    @if (loading()) {
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    } @else if (error()) {
      <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8">
        <p class="text-destructive">{{ error() }}</p>
        <button (click)="loadChannels()" class="mt-2 text-sm text-primary hover:underline">
          Try again
        </button>
      </div>
    } @else {
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <h2 class="text-xl font-bold text-foreground">Live Channels</h2>
            <span class="text-sm text-muted-foreground">({{ channels().length }})</span>
          </div>
          <button class="text-sm text-primary hover:text-primary/80 font-medium">
            Show More
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        @if (channels().length === 0) {
          <div class="text-center py-12 text-muted-foreground">
            <p>No channels are currently live.</p>
            <p class="text-sm mt-1">Check back later!</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            @for (channel of channels(); track channel.id) {
              <app-channel-card
                [username]="channel.username"
                [displayName]="channel.username"
                [thumbnailUrl]="channel.thumbnailUrl || 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=640&h=360&fit=crop'"
                [avatarUrl]="channel.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop'"
                [category]="channel.bio || 'Variety'"
                [isLive]="channel.isLive"
                [viewerCount]="channel.viewerCount"
              />
            }
          </div>
        }
      </section>
    }

    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-foreground">Browse Categories</h2>
        <button class="text-sm text-primary hover:text-primary/80 font-medium cursor-pointer">
          View All
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div class="flex gap-4 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        @for (category of categories; track category.name) {
          <button class="flex items-center gap-2 px-7 py-2 rounded-full bg-secondary hover:bg-primary hover:cursor-pointer transition-colors whitespace-nowrap">
            <img [src]="category.iconUrl" [alt]="category.name" class="w-6 h-6 rounded" />
            <span class="text-sm font-medium">{{ category.name }}</span>
            <span class="text-xs text-muted-foreground mx-2">{{ category.viewerCount }}</span>
          </button>
        }
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        @for (category of categories; track category.name) {
          <a href="#" class="group">
            <div class="relative aspect-video rounded-lg overflow-hidden bg-secondary">
              <img
                [src]="category.thumbnailUrl"
                [alt]="category.name"
                class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span class="text-white font-semibold text-sm">{{ category.viewerCount }}</span>
              </div>
            </div>
            <p class="text-sm font-medium text-foreground mt-2 truncate group-hover:text-primary">{{ category.name }}</p>
            <p class="text-xs text-muted-foreground">{{ category.streams }} streams</p>
          </a>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `
})
export class HomeComponent implements OnInit {
  channels = signal<Channel[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  categories = [
    { name: 'Fortnite', thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=320&h=180&fit=crop', iconUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=64&h=64&fit=crop', viewerCount: '125K', streams: 892 },
    { name: 'Valorant', thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=320&h=180&fit=crop', iconUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=64&h=64&fit=crop', viewerCount: '98K', streams: 654 },
    { name: 'Just Chatting', thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=320&h=180&fit=crop', iconUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=64&h=64&fit=crop', viewerCount: '234K', streams: 1234 },
    { name: 'GTA V', thumbnailUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=320&h=180&fit=crop', iconUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=64&h=64&fit=crop', viewerCount: '67K', streams: 445 },
    { name: 'League of Legends', thumbnailUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=320&h=180&fit=crop', iconUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=64&h=64&fit=crop', viewerCount: '156K', streams: 987 },
    { name: 'Minecraft', thumbnailUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=320&h=180&fit=crop', iconUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=64&h=64&fit=crop', viewerCount: '89K', streams: 567 },
    { name: 'CS2', thumbnailUrl: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=320&h=180&fit=crop', iconUrl: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=64&h=64&fit=crop', viewerCount: '112K', streams: 723 },
    { name: 'Apex Legends', thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=320&h=180&fit=crop', iconUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=64&h=64&fit=crop', viewerCount: '45K', streams: 321 }
  ];

  constructor(private channelService: ChannelService) {}

  ngOnInit() {
    this.loadChannels();
  }

  loadChannels() {
    this.loading.set(true);
    this.error.set(null);

    this.channelService.getChannels().subscribe({
      next: (channels) => {
        this.channels.set(channels);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load channels:', err);
        this.error.set('Failed to load channels. Please make sure the backend is running.');
        this.loading.set(false);
      }
    });
  }
}
