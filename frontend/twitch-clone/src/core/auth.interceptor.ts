import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { AuthService } from "../services/auth-service";
import { UserService } from "../app/services/user.service";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private refreshSubject = new BehaviorSubject<string | null>(null);
  private isRefreshing = false;

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    const req = request.clone({
      withCredentials: true,
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return next.handle(req).pipe(
      catchError((err) => {
        if ((err.status === 401 || err.status === 403) && !request.url.includes('/auth/refresh') && !request.url.includes('/auth/login') && !request.url.includes('/auth/register')) {
          return this.handleRefreshToken(request, next);
        }
        return throwError(() => err);
      })
    );
  }

  handleTokenError() {
    this.authService.clearAccessToken();
    this.userService.clearCurrentUser();
    this.router.navigate(['/login']);
  }

  handleRefreshToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject.next(null);
      return this.authService.refreshToken().pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;
          this.authService.setAccessToken(res.accessToken);
          this.refreshSubject.next(res.accessToken);

          const newReq = request.clone({
            withCredentials: true,
            setHeaders: { Authorization: `Bearer ${res.accessToken}` }
          });
          return next.handle(newReq);
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.handleTokenError();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => {
          const newReq = request.clone({
            withCredentials: true,
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next.handle(newReq);
        }),
        catchError(err => {
          this.handleTokenError();
          return throwError(() => err);
        })
      );
    }
  }
}
