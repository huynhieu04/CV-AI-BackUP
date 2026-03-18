// src/app/services/cv-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

const API_BASE = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class CvApiService {
    constructor(private http: HttpClient) { }

    /* =======================
       JOBS
    ======================= */
    getJobs(): Observable<any[]> {
        return this.http.get<any>(`${API_BASE}/jobs`).pipe(map((res) => res?.jobs ?? []));
    }

    searchJobs(keyword: string): Observable<any[]> {
        const params = new HttpParams().set('q', keyword || '');
        return this.http.get<any>(`${API_BASE}/jobs`, { params }).pipe(map((res) => res?.jobs ?? []));
    }

    getJobById(id: string): Observable<any> {
        return this.http.get<any>(`${API_BASE}/jobs/${id}`).pipe(map((res) => res?.job ?? res));
    }

    createJob(job: any): Observable<any> {
        return this.http.post<any>(`${API_BASE}/jobs`, job);
    }

    updateJob(id: string, payload: any): Observable<any> {
        return this.http.patch<any>(`${API_BASE}/jobs/${id}`, payload);
    }

    deleteJob(id: string): Observable<any> {
        return this.http.delete<any>(`${API_BASE}/jobs/${id}`);
    }

    importJobsExcel(file: File): Observable<any> {
        const form = new FormData();
        form.append('file', file);
        return this.http.post<any>(`${API_BASE}/jobs/import`, form);
    }

    /* =======================
       CANDIDATES
    ======================= */
    getCandidates(): Observable<any[]> {
        return this.http.get<any>(`${API_BASE}/candidates`).pipe(map((res) => res?.candidates ?? []));
    }

    getCandidateById(id: string): Observable<any> {
        return this.http.get<any>(`${API_BASE}/candidates/${id}`).pipe(map((res) => res?.candidate ?? res));
    }

    deleteCandidate(id: string): Observable<any> {
        return this.http.delete<any>(`${API_BASE}/candidates/${id}`);
    }

    /* =======================
       CV + AI
    ======================= */
    uploadCv(file: File): Observable<any> {
        const form = new FormData();
        form.append('file', file); // key "file" khớp upload.single("file")
        return this.http.post<any>(`${API_BASE}/cv/upload`, form);
    }

    // ✅ NEW: upload nhiều CV cùng lúc
    uploadCvBatch(files: File[]): Observable<any> {
        const form = new FormData();
        for (const f of files) {
            form.append('files', f); // key "files" khớp upload.array("files", 20)
        }
        return this.http.post<any>(`${API_BASE}/cv/upload-batch`, form);
    }

    // ✅ NEW: tiện dùng (1 file thì dùng uploadCv, nhiều file thì uploadCvBatch)
    uploadCvSmart(files: File[] | File): Observable<any> {
        const list = Array.isArray(files) ? files : [files];
        return list.length <= 1 ? this.uploadCv(list[0]) : this.uploadCvBatch(list);
    }

    matchOne(candidateId: string, jobId: string): Observable<any> {
        return this.http.post<any>(`${API_BASE}/ai/match-one`, { candidateId, jobId });
    }

    autoMatch(candidateId: string): Observable<any> {
        return this.http.post<any>(`${API_BASE}/ai/auto-match`, { candidateId });
    }

    /* =======================
       REPORTS / SETTINGS
    ======================= */
    getOverviewReport(): Observable<any> {
        return this.http.get<any>(`${API_BASE}/reports/summary`);
    }

    getAiSettings(): Observable<any> {
        return this.http.get<any>(`${API_BASE}/settings`);
    }

    updateAiSettings(payload: any): Observable<any> {
        return this.http.put<any>(`${API_BASE}/settings`, payload);
    }

    /* =======================
       USERS (ADMIN)
    ======================= */
    getUsers(): Observable<any[]> {
        return this.http.get<any>(`${API_BASE}/users`).pipe(map((res) => res?.users ?? []));
    }

    createUser(payload: any): Observable<any> {
        return this.http.post<any>(`${API_BASE}/users`, payload);
    }

    updateUser(id: string, payload: any): Observable<any> {
        return this.http.patch<any>(`${API_BASE}/users/${id}`, payload);
    }

    deleteUser(id: string): Observable<any> {
        return this.http.delete<any>(`${API_BASE}/users/${id}`);
    }
}
