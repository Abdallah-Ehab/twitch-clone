import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, filter, switchMap, take } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { map } from "rxjs/internal/operators/map";
import { AuthService } from "../services/auth-service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private refreshSubject = new BehaviorSubject<string | null>(null);
  private isRefreshing = false;
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const req = request.clone({
      withCredentials: true
    })
    return next.handle(req).pipe(
      catchError((err)=>{
        if(err.status === 401 && !request.url.includes('/api/auth/refresh')){
          // if the error is 401, we try to refresh the token and retry the request
          return this.handleRefreshToken(request, next);
        }
        console.log(err);
        throw err;
      })
    );
  }

  handleRefreshToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

      if(!this.isRefreshing){
        // I need to get the new access token and retry the failed request
          return this.authService.refreshToken().pipe(
            // we use switchMap to switch between the observable returned by refreshToken and the one returned by next.handle
            // meaning now the observable returned by this function will emit the result of next.handle instead of refreshToken
            switchMap((res)=>{
              // retry the failed request with the new access token
              const newReq = request.clone({
                withCredentials: true
              });
              this.isRefreshing = false;
              this.refreshSubject.next(res as any);
              return next.handle(newReq);
            }),
            catchError(err=>{
              console.log('Refresh token failed', err);
              throw err;
            })
          )
      }else{
        // if we are already refreshing the token, we wait for the refreshSubject to emit the new access token and then retry the request
        return this.refreshSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap((token)=>{
            const newReq = request.clone({
              withCredentials: true
            });
            return next.handle(newReq);
          })
        );
      }
  }
}

