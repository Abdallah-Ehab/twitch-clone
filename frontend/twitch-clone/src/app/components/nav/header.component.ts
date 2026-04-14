import { Component, inject, OnInit, signal, HostListener, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrnButton } from '@spartan-ng/brain/button';
import { UserService } from '../../services/user.service';
import { ChannelService, Channel } from '../../services/channel.service';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';
import { firstValueFrom, Subject, switchMap, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [BrnButton, FormsModule],
  template: `
    <header class="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="flex h-14 items-center px-4 gap-4">
        <div class="flex items-center gap-4">
          <button class="flex md:hidden items-center justify-center w-9 h-9 rounded-md hover:bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <a href="/" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
            </svg>
            <span class="hidden md:block font-bold text-lg">StreamHub</span>
          </a>
        </div>

        <div class="flex-1 max-w-xl hidden sm:block relative">
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              (keydown.enter)="performSearch()"
              placeholder="Search streams, channels, or games"
              class="w-full h-9 bg-secondary border border-input rounded-l-md pl-4 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button 
              (click)="performSearch()"
              class="absolute right-0 top-0 h-full px-3 bg-muted hover:bg-muted/80 border border-l-0 border-input rounded-r-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          @if (searchResults().length > 0 && showDropdown()) {
            <div class="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50">
              @for (channel of searchResults(); track channel.id) {
                <a 
                  [href]="'/channel/' + channel.username"
                  class="flex items-center gap-3 px-4 py-2 hover:bg-muted cursor-pointer"
                  (click)="closeSearchDropdown()"
                >
                  <img 
                    [src]="channel.avatarUrl || defaultAvatar" 
                    [alt]="channel.username"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-foreground truncate">{{ channel.username }}</p>
                    <p class="text-xs text-muted-foreground truncate">{{ channel.category || 'Variety' }}</p>
                  </div>
                  @if (channel.isLive) {
                    <span class="px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded">LIVE</span>
                  }
                </a>
              }
              <a 
                [href]="'/search?q=' + encodeURIComponent(searchQuery)"
                class="block px-4 py-2 text-sm text-primary hover:bg-muted border-t border-border"
                (click)="closeSearchDropdown()"
              >
                See all results for "{{ searchQuery }}"
              </a>
            </div>
          }
        </div>

        <div class="flex items-center gap-2 ml-auto">
          <button class="flex sm:hidden items-center justify-center w-9 h-9 rounded-md hover:bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          @if (!userService.isLoggedIn()) {
            <div class="hidden md:flex items-center gap-2">
              <a href="/login" brnButton variant="outline" class="text-sm font-medium">Log In</a>
              <a href="/register" brnButton class="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 p-2 rounded">Sign Up</a>
            </div>
          } @else {
            <div class="relative">
              <button 
                (click)="toggleDropdown()" 
                class="flex items-center gap-2 px-1 rounded-md hover:bg-muted"
              >
                <img
                  [src]="userService.currentUser()?.avatarUrl || defaultAvatar"
                  [alt]="userService.currentUser()?.username + ' avatar'"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              @if (isDropdownOpen()) {
                <div class="absolute right-0 mt-2 w-56 rounded-md border border-border bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div class="py-1">
                    <div class="px-4 py-2 border-b border-border">
                      <p class="text-sm font-medium text-foreground">{{ userService.currentUser()?.username }}</p>
                      <p class="text-xs text-muted-foreground">{{ userService.currentUser()?.email }}</p>
                    </div>
                    <a 
                      href="/dashboard" 
                      class="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                      (click)="closeDropdown()"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </a>
                    <button 
                      (click)="logout()" 
                      class="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-muted"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class HeaderComponent implements OnInit {
  userService = inject(UserService);
  private authService = inject(AuthService);
  private channelService = inject(ChannelService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  isDropdownOpen = signal(false);
  searchQuery = '';
  searchResults = signal<Channel[]>([]);
  showDropdown = signal(false);
  defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

  private searchSubject = new Subject<string>();

  ngOnInit() {
    if (this.userService.isLoggedIn() && !this.userService.currentUser()?.avatarUrl) {
      this.fetchUserProfile();
    }

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          return [];
        }
        return this.channelService.searchChannels(query);
      })
    ).subscribe(results => {
      this.searchResults.set(results);
      this.showDropdown.set(true);
    });
  }

  onSearchInput() {
    if (this.searchQuery.length < 2) {
      this.searchResults.set([]);
      this.showDropdown.set(false);
    } else {
      this.searchSubject.next(this.searchQuery);
    }
  }

  performSearch() {
    if (this.searchQuery.trim()) {
      this.closeSearchDropdown();
      this.router.navigate(['/'], { queryParams: { search: this.searchQuery.trim() } });
    }
  }

  closeSearchDropdown() {
    this.showDropdown.set(false);
  }

  encodeURIComponent(str: string): string {
    return encodeURIComponent(str);
  }

  private async fetchUserProfile() {
    this.userService.fetchCurrentUser().subscribe();
  }

  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
      this.closeSearchDropdown();
    }
  }

  async logout() {
    try {
      await firstValueFrom(this.authService.logout());
    } catch (e) {
      // Ignore errors
    }
    this.authService.clearAccessToken();
    this.userService.clearCurrentUser();
    this.closeDropdown();
    this.router.navigate(['/']);
  }
}
