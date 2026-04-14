import { Component, OnInit, signal, computed } from '@angular/core';
import { ChannelCardComponent } from '../../components/shared/channel-card.component';
import { ChannelService, Channel } from '../../services/channel.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ChannelCardComponent,
    FormsModule
  ],
  template: `
    <section class="mb-8">
      <div class="rounded-xl bg-gradient-to-r from-purple-900/50 to-primary/20 p-8">
        <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-2">
          @if (searchQuery()) {
            Search Results for "{{ searchQuery() }}"
          } @else {
            Welcome to StreamHub
          }
        </h1>
        <p class="text-muted-foreground text-lg">
          @if (searchQuery()) {
            Found {{ total() }} channels matching your search
          } @else {
            Discover live streams, connect with creators, and join a community of gamers.
          }
        </p>
      </div>
    </section>

    <section class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-foreground">Category:</label>
          <select 
            [(ngModel)]="selectedCategory"
            (ngModelChange)="onFilterChange()"
            class="h-9 px-3 bg-secondary border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Categories</option>
            @for (cat of categories(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-foreground">Sort by:</label>
          <select 
            [(ngModel)]="selectedSort"
            (ngModelChange)="onFilterChange()"
            class="h-9 px-3 bg-secondary border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="viewers">Most Viewers</option>
            <option value="recent">Recently Live</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-foreground">Status:</label>
          <select 
            [(ngModel)]="liveOnly"
            (ngModelChange)="onFilterChange()"
            class="h-9 px-3 bg-secondary border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option [value]="true">Live Only</option>
            <option [value]="false">All Channels</option>
          </select>
        </div>

        @if (searchQuery() || selectedCategory || selectedSort !== 'viewers' || !liveOnly) {
          <button 
            (click)="clearFilters()"
            class="h-9 px-3 text-sm font-medium text-primary hover:bg-muted rounded-md transition-colors"
          >
            Clear Filters
          </button>
        }
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
            @if (liveOnly) {
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <h2 class="text-xl font-bold text-foreground">Live Channels</h2>
            } @else {
              <h2 class="text-xl font-bold text-foreground">All Channels</h2>
            }
            <span class="text-sm text-muted-foreground">({{ total() }})</span>
          </div>
        </div>

        @if (channels().length === 0) {
          <div class="text-center py-12 text-muted-foreground">
            <p>No channels found.</p>
            <p class="text-sm mt-1">Try adjusting your filters or search terms.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            @for (channel of channels(); track channel.id) {
              <app-channel-card
                [username]="channel.username"
                [displayName]="channel.username"
                [thumbnailUrl]="channel.thumbnailUrl || 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=640&h=360&fit=crop'"
                [avatarUrl]="channel.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop'"
                [category]="channel.category || 'Variety'"
                [isLive]="channel.isLive"
                [viewerCount]="channel.viewerCount"
              />
            }
          </div>

          @if (totalPages() > 1) {
            <div class="flex items-center justify-center gap-2 mt-8">
              <button 
                (click)="goToPage(currentPage() - 1)"
                [disabled]="currentPage() === 1 || isLoadingPage()"
                class="px-3 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              @for (page of visiblePages(); track page) {
                @if (page === '...') {
                  <span class="px-3 py-2 text-sm text-muted-foreground">...</span>
                } @else {
                  <button 
                    (click)="goToPage(+page)"
                    [disabled]="isLoadingPage()"
                    [class.bg-primary]="currentPage() === +page"
                    [class.text-primary-foreground]="currentPage() === +page"
                    [class.bg-muted]="currentPage() !== +page"
                    class="px-3 py-2 rounded-md text-sm font-medium border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {{ page }}
                  </button>
                }
              }

              <button 
                (click)="goToPage(currentPage() + 1)"
                [disabled]="currentPage() === totalPages() || isLoadingPage()"
                class="px-3 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          }
        }
      </section>
    }

    @if (!searchQuery() && !selectedCategory && selectedSort === 'viewers' && liveOnly) {
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-foreground">Browse Categories</h2>
        </div>

        <div class="flex gap-4 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          @for (cat of categories(); track cat) {
            <button 
              (click)="selectCategory(cat)"
              class="flex items-center gap-2 px-7 py-2 rounded-full bg-secondary hover:bg-primary hover:cursor-pointer transition-colors whitespace-nowrap"
            >
              <span class="text-sm font-medium">{{ cat }}</span>
            </button>
          }
        </div>
      </section>
    }
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
  categories = signal<string[]>([]);
  loading = signal(true);
  isLoadingPage = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalPages = signal(1);
  total = signal(0);
  searchQuery = signal<string>('');
  
  selectedCategory = '';
  selectedSort: 'viewers' | 'recent' | 'alphabetical' = 'viewers';
  liveOnly = true;

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }

    return pages;
  });

  constructor(
    private channelService: ChannelService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadCategories();
    
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery.set(params['search']);
        this.currentPage.set(1);
        this.loadChannels();
      } else {
        this.loadChannels();
      }
    });
  }

  loadCategories() {
    this.channelService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => this.categories.set(['Fortnite', 'Valorant', 'Just Chatting', 'GTA V', 'League of Legends', 'CS2'])
    });
  }

  loadChannels() {
    this.loading.set(true);
    this.error.set(null);

    const filters = {
      page: this.currentPage(),
      limit: 12,
      liveOnly: this.liveOnly,
      search: this.searchQuery() || undefined,
      category: this.selectedCategory || undefined,
      sortBy: this.selectedSort
    };

    this.channelService.getChannels(filters).subscribe({
      next: (result) => {
        this.channels.set(result.channels);
        this.total.set(result.total);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
        this.isLoadingPage.set(false);
      },
      error: (err) => {
        console.error('Failed to load channels:', err);
        this.error.set('Failed to load channels. Please make sure the backend is running.');
        this.loading.set(false);
        this.isLoadingPage.set(false);
      }
    });
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadChannels();
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.onFilterChange();
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategory = '';
    this.selectedSort = 'viewers';
    this.liveOnly = true;
    this.currentPage.set(1);
    this.loadChannels();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage() || this.isLoadingPage()) {
      return;
    }
    this.currentPage.set(page);
    this.isLoadingPage.set(true);
    this.loadChannels();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
