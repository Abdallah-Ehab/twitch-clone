import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../components/nav/header.component';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="min-h-screen bg-background">
      <app-header />
      <main class="container mx-auto px-4 py-6">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class MainLayoutComponent {
  private userService = inject(UserService);

  // ngOnInit() {
  //   this.userService.fetchCurrentUser().subscribe();
  // }
}
