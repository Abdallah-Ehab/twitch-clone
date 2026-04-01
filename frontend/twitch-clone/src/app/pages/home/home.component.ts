import { Component } from '@angular/core';
import { ChannelCardComponent } from '../../components/shared/channel-card.component';
import { HeaderComponent } from '../../components/nav/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ChannelCardComponent,
    HeaderComponent,
  ],
  template: `
    <div class="min-h-screen bg-background">
      <app-header />

      <main class="container mx-auto px-4 py-6">
        <!-- Hero Section -->
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

        <!-- Live Channels Section -->
        <section class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <h2 class="text-xl font-bold text-foreground">Live Channels</h2>
              <span class="text-sm text-muted-foreground">({{ liveChannels.length }})</span>
            </div>
            <button class="text-sm text-primary hover:text-primary/80 font-medium">
              Show More
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Channel Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            @for (channel of liveChannels; track channel.username) {
              <app-channel-card
                [username]="channel.username"
                [displayName]="channel.displayName"
                [thumbnailUrl]="channel.thumbnailUrl"
                [avatarUrl]="channel.avatarUrl"
                [category]="channel.category"
                [isLive]="channel.isLive"
                [viewerCount]="channel.viewerCount"
                [tags]="channel.tags"
              />
            }
          </div>
        </section>

        <!-- Categories Section -->
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

          <!-- Category Pills -->
          <div class="flex gap-4 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            @for (category of categories; track category.name) {
              <button class="flex items-center gap-2 px-7 py-2 rounded-full bg-secondary hover:bg-primary hover:cursor-pointer transition-colors whitespace-nowrap">
                <img [src]="category.iconUrl" [alt]="category.name" class="w-6 h-6 rounded" />
                <span class="text-sm font-medium">{{ category.name }}</span>
                <span class="text-xs text-muted-foreground mx-2">{{ category.viewerCount }}</span>
              </button>
            }
          </div>

          <!-- Category Grid -->
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
      </main>
    </div>
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
export class HomeComponent {
  liveChannels = [
    {
      username: 'ninja',
      displayName: 'Ninja',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop',
      category: 'Fortnite',
      isLive: true,
      viewerCount: 45200,
      tags: ['English', 'FPS', 'Competitive']
    },
    {
      username: 'pokimane',
      displayName: 'Pokimane',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=640&h=360&fit=crop',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop',
      category: 'Just Chatting',
      isLive: true,
      viewerCount: 28500,
      tags: ['English', 'Variety']
    },
    {
      username: 'shroud',
      displayName: 'Shroud',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=640&h=360&fit=crop',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop',
      category: 'Valorant',
      isLive: true,
      viewerCount: 32100,
      tags: ['English', 'FPS']
    },
    {
      username: 'sykkuno',
      displayName: 'Sykkuno',
      thumbnailUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=640&h=360&fit=crop',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=64&h=64&fit=crop',
      category: 'GTA V',
      isLive: true,
      viewerCount: 18900,
      tags: ['English', 'RP']
    },
    {
      username: 'ludwig',
      displayName: 'Ludwig',
      thumbnailUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=640&h=360&fit=crop',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop',
      category: 'Variety',
      isLive: true,
      viewerCount: 22100,
      tags: ['English', 'Variety']
    },
    {
      username: 'xQc',
      displayName: 'xQc',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=640&h=360&fit=crop',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop',
      category: 'Just Chatting',
      isLive: true,
      viewerCount: 67800,
      tags: ['English', 'Variety', 'Reactions']
    },
    {
      username: 's1mple',
      displayName: 's1mple',
      thumbnailUrl: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=640&h=360&fit=crop',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop',
      category: 'CS2',
      isLive: true,
      viewerCount: 89400,
      tags: ['English', 'FPS', 'Competitive']
    },
    {
      username: 'fuslie',
      displayName: 'Fuslie',
      thumbnailUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=640&h=360&fit=crop',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop',
      category: 'Variety',
      isLive: true,
      viewerCount: 15600,
      tags: ['English', 'Variety']
    }
  ];

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
}
