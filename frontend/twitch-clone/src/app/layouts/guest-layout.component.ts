import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-guest-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-background">
      <header class="h-14 border-b border-border flex items-center px-4">
        <a href="/" class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
          </svg>
          <span class="font-bold text-lg">StreamHub</span>
        </a>
      </header>
      <router-outlet />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class GuestLayoutComponent {}
