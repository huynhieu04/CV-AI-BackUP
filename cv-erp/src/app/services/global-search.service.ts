import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
    private _term$ = new BehaviorSubject<string>('');

    term$ = this._term$.asObservable();

    setTerm(term: string) {
        this._term$.next(term || '');
    }

    get currentTerm(): string {
        return this._term$.value;
    }
}
