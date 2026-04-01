import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LiveBadgeComponent } from './live-badge.component';

@Component({
  selector: 'app-channel-card',
  standalone: true,
  imports: [RouterLink, LiveBadgeComponent],
  template: `
    <a [routerLink]="['/channel', username]" class="group block">
      <!-- Thumbnail Container -->
      <div class="relative aspect-video rounded-lg overflow-hidden bg-secondary">
        <!-- Thumbnail Image -->
        <img 
          [src]="thumbnailUrl" 
          [alt]="username + ' stream thumbnail'"
          class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        
        <!-- Overlay Gradient -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <!-- Live Badge & Viewer Count -->
        <div class="absolute top-2 left-2 flex items-center gap-2">
          @if (isLive) {
            <app-live-badge />
          }
          @if (isRecording) {
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-gray-800 text-white">
              RERUN
            </span>
          }
        </div>
        
        @if (isLive) {
          <div class="absolute bottom-2 left-2">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 text-xs text-white font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ formatViewerCount(viewerCount) }}
            </span>
          </div>
        }
      </div>
      
      <!-- Channel Info -->
      <div class="flex gap-3 mt-3">
        <!-- Avatar -->
        <img 
          [src]="avatarUrl" 
          [alt]="username + ' avatar'"
          class="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-muted"
        />
        
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {{ displayName || username }}
          </h3>
          <p class="text-xs text-muted-foreground truncate">{{ username }}</p>
          @if (category) {
            <p class="text-xs text-muted-foreground truncate mt-0.5">{{ category }}</p>
          }
          @if (tags && tags.length > 0) {
            <div class="flex gap-1 mt-1.5 flex-wrap">
              @for (tag of tags.slice(0, 3); track tag) {
                <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                  {{ tag }}
                </span>
              }
            </div>
          }
        </div>
      </div>
    </a>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class ChannelCardComponent {
  @Input() username = 'channel';
  @Input() displayName = '';
  @Input() thumbnailUrl = 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=640&h=360&fit=crop';
  @Input() avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop';
  @Input() category = '';
  @Input() isLive = true;
  @Input() isRecording = false;
  @Input() viewerCount = 0;
  @Input() tags: string[] = [];

  getInitials(name: string): string {
    return name.substring(0, 2).toUpperCase();
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
