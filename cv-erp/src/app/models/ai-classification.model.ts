// src/app/models/ai-classification.model.ts
export type CandidateStatus = 'Suitable' | 'Potential' | 'NotFit';

export interface CandidateRow {
    name: string;
    recommendedJob: string;
    matchScore: number;
    status: CandidateStatus;
    tags: string[];
}

export interface AiMatchSummary {
    mainSkills: string[];
    mainDomains: string[];
    seniority: string;
}

export interface AiClassificationState {
    candidates: CandidateRow[];
    selectedCandidate: CandidateRow | null;
    matchTags: string[];
    matchSummary: AiMatchSummary | null;
    errorMessage: string | null;
}
