export interface Job {
    _id?: string;
    title: string;
    code: string;
    description: string;
    skills: string[];
    minYearsExp?: number;
    domain?: string;
}

export type CandidateStatus = 'Suitable' | 'Potential' | 'NotFit';

export interface CandidateRow {
    id?: string;
    name: string;
    email?: string;
    recommendedJob: string;
    matchScore: number;
    status: CandidateStatus;
    tags: string[];
}
