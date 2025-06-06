import { HttpInterceptorFn, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authToken = localStorage.getItem('token');

  // Skip auth for login and register endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register') || req.url.includes('/auth/pre-login')) {
    return next(req);
  }

  if (!authToken) {
    router.navigate(['/login']);
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
}; 