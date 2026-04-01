import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center p-4">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-foreground mb-4">404</h1>
        <p class="text-xl text-muted-foreground mb-2">Page Not Found</p>
        <p class="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <a 
          routerLink="/" 
          class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Home
        </a>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class NotFoundComponent {}
