/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';

import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.addTokenToRequest(request, this.authService.getAccesToken())).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return this.handle401Error(request, next);
        }

        return throwError(() => this.mapResponse(err));
      }),
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    return this.authService
      .refreshToken()
      .pipe(
        switchMap((success) =>
          success
            ? next.handle(this.addTokenToRequest(request, this.authService.getAccesToken()))
            : throwError(() => new Error('Failed to refresh token')),
        ),
      );
  }

  private mapResponse(err: any): any {
    const response = {
      code: 'UndefinedError',
      description: '',
    };

    if (err.error?.modelState?.error && err.error.modelState.error.length > 0) {
      response.code = err.error.modelState.error[0];
      response.description = err.error.modelState.error[0];
      return response;
    }

    if (err.error?.error) {
      if (err.error.error !== 'error') {
        response.code = err.error.error;
        response.description = err.error.error_description;
        return response;
      } else if (err.error.error_description) {
        response.code = err.error.error_description;
        return response;
      }
    }
    if (err.error?.modelState && Object.keys(err.error.modelState).length > 0) {
      for (const propertyName of Object.keys(err.error.modelState)) {
        response.code = propertyName.toUpperCase();
        if (err.error.modelState[propertyName] && err.error.modelState[propertyName].length > 0) {
          response.description = err.error.modelState[propertyName][0];
        }
      }

      return response;
    }

    if (err.status > 0) {
      response.code = '_' + err.status;
      response.description = err.statusText;
      return response;
    }

    return response;
  }
}
