import { inject } from '@angular/core';
import {
    HttpInterceptorFn
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { API_URL } from '../api.config';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
    req,
    next
) => {
    const authService =
        inject(AuthService);

    let request = req;

    if (
        req.url.startsWith(API_URL)
    ) {
        const token =
            authService.token;

        if (token) {
            request = req.clone({
                setHeaders: {
                    Authorization:
                        `Bearer ${token}`
                }
            });
        }
    }

    return next(request).pipe(
        catchError((error) => {
            const esLogin =
                request.url.endsWith(
                    '/auth/login'
                );

            if (
                error.status === 401 &&
                !esLogin
            ) {
                authService.logout();
            }

            return throwError(
                () => error
            );
        })
    );
};