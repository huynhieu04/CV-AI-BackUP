import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
    constructor(private auth: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.auth.getToken();

        // Không có token → đi tiếp
        if (!token) return next.handle(req);

        // Gắn Bearer token
        const cloned = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        });

        return next.handle(cloned);
    }
}
