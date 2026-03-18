import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type Role = 'HR' | 'ADMIN';

export interface AppUser {
    id: string;
    username: string;
    name: string;
    email: string;
    role: Role;
    createdAt: string;
}

//  dùng apiBaseUrl giống các service khác của bạn
const API_BASE = environment.apiBaseUrl;

function toAppUser(u: any): AppUser {
    return {
        id: u.id || u._id,
        username: u.username,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
    };
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
    constructor(private http: HttpClient) { }

    list(): Observable<AppUser[]> {
        return this.http
            .get<any>(`${API_BASE}/users`, {
                params: { _ts: Date.now() },
                headers: new HttpHeaders({
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                }),
            })
            .pipe(map((res) => (res.users || []).map(toAppUser)));
    }

    create(payload: any): Observable<AppUser> {
        return this.http
            .post<any>(`${API_BASE}/users`, payload)
            .pipe(map((res) => toAppUser(res.user)));
    }

    update(id: string, payload: any): Observable<AppUser> {
        return this.http
            .patch<any>(`${API_BASE}/users/${id}`, payload)
            .pipe(map((res) => toAppUser(res.user)));
    }

    delete(id: string): Observable<void> {
        return this.http
            .delete<any>(`${API_BASE}/users/${id}`)
            .pipe(map(() => void 0));
    }
}
