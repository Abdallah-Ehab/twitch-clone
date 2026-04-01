import { Component } from '@angular/core';

@Component({
  selector: 'app-live-badge',
  standalone: true,
  imports: [],
  template: `
    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-red-600 text-white uppercase tracking-wide">
      <span class="w-1.5 h-1.5 rounded-full bg-white mr-1 animate-pulse"></span>
      Live
    </span>
  `,
  styles: `
    :host {
      display: inline-block;
    }
  `
})
export class LiveBadgeComponent {}
