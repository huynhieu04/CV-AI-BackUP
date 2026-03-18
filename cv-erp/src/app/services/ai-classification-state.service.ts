import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
    AiClassificationState,
} from '../models/ai-classification.model';

@Injectable({ providedIn: 'root' })
export class AiClassificationStateService {
    private stateSubject = new BehaviorSubject<AiClassificationState | null>(null);
    state$ = this.stateSubject.asObservable();

    setState(state: AiClassificationState | null) {
        this.stateSubject.next(state);
    }

    getSnapshot(): AiClassificationState | null {
        return this.stateSubject.value;
    }
}
