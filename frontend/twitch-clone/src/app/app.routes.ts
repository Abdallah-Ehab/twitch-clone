import { Routes } from '@angular/router';
import { guestGuard } from '../core/guest.guard';
import { routeGuard } from '../core/route.guard';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard], // only guests
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard], // only guests
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [routeGuard], // only logged-in users
  },
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
