import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../app/services/user.service';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth-service';

export const routeGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (userService.isLoggedIn() && authService.getAccessToken()) {
    return true;
  }

  if (!authService.getAccessToken()) {
    return router.createUrlTree(['/login']);
  }

  return userService.fetchCurrentUser().pipe(
    map(user => user ? true : router.createUrlTree(['/login'])),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};

export const guestGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!userService.isLoggedIn() || !authService.getAccessToken()) {
    return true;
  }

  return userService.fetchCurrentUser().pipe(
    map(user => {
      if (user) {
        return router.createUrlTree(['/']);
      }
      return true;
    }),
    catchError(() => of(true))
  );
};
