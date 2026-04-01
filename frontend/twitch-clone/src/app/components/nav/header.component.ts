import { Component } from '@angular/core';
import { BrnButton } from '@spartan-ng/brain/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    BrnButton,
  ],
  template: `
    <header class="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="flex h-14 items-center px-4 gap-4">
        <!-- Logo & Mobile Menu -->
        <div class="flex items-center gap-4">
          <!-- Mobile Menu Toggle -->
          <button class="flex md:hidden items-center justify-center w-9 h-9 rounded-md hover:bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Logo -->
          <a href="/" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
            </svg>
            <span class="hidden md:block font-bold text-lg">StreamHub</span>
          </a>
        </div>

        <!-- Search Bar -->
        <div class="flex-1 max-w-xl hidden sm:block">
          <div class="relative">
            <input
              type="text"
              placeholder="Search streams, channels, or games"
              class="w-full h-9 bg-secondary border border-input rounded-l-md pl-4 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button class="absolute right-0 top-0 h-full px-3 bg-muted hover:bg-muted/80 border border-l-0 border-input rounded-r-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-2 ml-auto">
          <!-- Mobile Search -->
          <button class="flex sm:hidden items-center justify-center w-9 h-9 rounded-md hover:bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- Auth Buttons (Logged Out State) -->
          <div class="hidden md:flex items-center gap-2">
            <a href="/auth" brnButton variant="outline" class="text-sm font-medium">Log In</a>
            <a href="/auth" brnButton class="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 p-2 rounded hover:">Sign Up</a>
          </div>

          <!-- User Menu (Logged In State - Shown for UI) -->
          <div class="relative">
            <button class="flex items-center gap-2 px-1 rounded-md hover:bg-muted">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop"
                alt="User avatar"
                class="w-8 h-8 rounded-full object-cover"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
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
export class HeaderComponent {}
