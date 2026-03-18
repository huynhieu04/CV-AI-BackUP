import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {

                // ✅ LUÔN LOG
                console.error('🔥 HTTP ERROR:', err.status, err.error);

                // ✅ CỰC KỲ QUAN TRỌNG
                return throwError(() => err);
            })
        );
    }
}
