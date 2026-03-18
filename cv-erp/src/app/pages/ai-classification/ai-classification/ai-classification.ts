import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { CvApiService } from '../../../services/cv-api.service';
import {
  CandidateRow,
  CandidateStatus,
  AiMatchSummary,
  AiClassificationState,
} from '../../../models/ai-classification.model';
import { AiClassificationStateService } from '../../../services/ai-classification-state.service';

type CvItem = {
  id: string;              // local id
  fileName: string;
  ok: boolean;
  message?: string | null;

  // response-like payload
  raw?: any;
  rows: CandidateRow[];
  summary: AiMatchSummary | null;
  firstRow: CandidateRow | null;
  error: string | null;
};

@Component({
  selector: 'app-ai-classification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-classification.html',
  styleUrls: ['./ai-classification.scss'],
})
export class AiClassificationComponent implements OnInit {
  // upload
  selectedFiles: File[] = [];
  selectedFileName: string | null = null;

  isMatching = false;
  isLoadingFromDb = false;
  errorMessage: string | null = null;

  // UI legacy (bảng dưới)
  candidates: CandidateRow[] = [];
  selectedCandidate: CandidateRow | null = null;
  matchTags: string[] = [];
  matchSummary: AiMatchSummary | null = null;

  // ✅ NEW: list CV results + filter
  cvResults: CvItem[] = [];
  activeCvId: string | null = null;

  constructor(
    private cvApi: CvApiService,
    private cdr: ChangeDetectorRef,
    private stateService: AiClassificationStateService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.restoreState();

    this.route.queryParams.subscribe((params) => {
      const candidateId = params['candidateId'];
      if (candidateId) this.loadAiResultFromDb(candidateId);
    });
  }

  /* =========================
     STATE
  ========================= */

  private restoreState() {
    const snapshot = this.stateService.getSnapshot();
    if (!snapshot) return;

    // legacy
    this.candidates = snapshot.candidates;
    this.selectedCandidate = snapshot.selectedCandidate;
    this.matchTags = snapshot.matchTags;
    this.matchSummary = snapshot.matchSummary;
    this.errorMessage = snapshot.errorMessage;

    // ✅ NEW (optional): nếu bạn muốn lưu cvResults luôn thì mở ra
    // (hiện tại model AiClassificationState của bạn chưa có field này)
  }

  private saveState() {
    const state: AiClassificationState = {
      candidates: this.candidates,
      selectedCandidate: this.selectedCandidate,
      matchTags: this.matchTags,
      matchSummary: this.matchSummary,
      errorMessage: this.errorMessage,
    };
    this.stateService.setState(state);
  }

  /* =========================
     UPLOAD HANDLERS
  ========================= */

  onFilesChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    if (!files.length) {
      this.selectedFiles = [];
      this.selectedFileName = null;
      this.errorMessage = null;
      return;
    }

    this.selectedFiles = files;
    this.selectedFileName = files.length === 1 ? files[0].name : `${files.length} files`;
    this.errorMessage = null;
  }

  clearFiles() {
    this.selectedFiles = [];
    this.selectedFileName = null;
    this.errorMessage = null;

    // clear UI
    this.cvResults = [];
    this.activeCvId = null;

    this.candidates = [];
    this.selectedCandidate = null;
    this.matchTags = [];
    this.matchSummary = null;

    this.saveState();
    this.cdr.detectChanges();
  }

  onRunMatching() {
    if (!this.selectedFiles.length) {
      this.errorMessage = 'Vui lòng chọn ít nhất 1 file CV trước khi chạy AI matching.';
      return;
    }

    this.isMatching = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    // reset current results (để không lẫn dữ liệu cũ)
    this.cvResults = [];
    this.activeCvId = null;

    // ✅ CASE 1: 1 file
    if (this.selectedFiles.length === 1) {
      const file = this.selectedFiles[0];

      this.cvApi.uploadCv(file).subscribe({
        next: (res: any) => {
          const item = this.buildCvItemFromResult(file.name, res, true, null);
          this.cvResults = [item];
          this.setActiveCv(item.id);

          this.isMatching = false;
          this.saveState();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isMatching = false;
          this.errorMessage = err?.error?.message || 'Upload CV thất bại.';
          this.cdr.detectChanges();
        },
      });

      return;
    }

    // ✅ CASE 2: nhiều file -> batch
    this.cvApi.uploadCvBatch(this.selectedFiles).subscribe({
      next: (res: any) => {
        const results: any[] = Array.isArray(res?.results) ? res.results : [];

        // map từng kết quả thành cvResults
        const mapped: CvItem[] = results.map((r, idx) => {
          const fileName =
            r?.fileName ||
            r?.originalName ||
            this.selectedFiles[idx]?.name ||
            `CV #${idx + 1}`;

          const ok = !!r?.ok;
          const msg = r?.message || null;

          if (!ok) {
            return {
              id: this.makeId(),
              fileName,
              ok: false,
              message: msg || 'Upload/parse lỗi.',
              raw: r,
              rows: [],
              summary: null,
              firstRow: null,
              error: msg || 'Upload/parse lỗi.',
            };
          }

          return this.buildCvItemFromResult(fileName, r, true, null);
        });

        this.cvResults = mapped;

        // chọn CV đầu tiên ok
        const firstOk = mapped.find((x) => x.ok && x.rows.length);
        if (firstOk) {
          this.setActiveCv(firstOk.id);
        } else {
          // không có cái nào ok
          this.resetUi('Batch upload xong nhưng không có CV nào trả kết quả AI hợp lệ.');
        }

        // show summary lỗi nếu có fail
        const failed = mapped.filter((x) => !x.ok);
        if (failed.length) {
          const extra = `(${failed.length}/${mapped.length} CV lỗi. Kiểm tra định dạng/dung lượng.)`;
          this.errorMessage = this.errorMessage ? `${this.errorMessage} ${extra}` : extra;
        }

        this.isMatching = false;
        this.saveState();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isMatching = false;
        this.errorMessage = err?.error?.message || 'Upload batch thất bại.';
        this.cdr.detectChanges();
      },
    });
  }

  private buildCvItemFromResult(fileName: string, res: any, ok: boolean, message: string | null): CvItem {
    const { rows, summary, firstRow, error } = this.buildUiFromUploadResponse(res);

    return {
      id: this.makeId(),
      fileName,
      ok,
      message,
      raw: res,
      rows,
      summary,
      firstRow,
      error,
    };
  }

  /* =========================
     FILTER / SWITCH CV
  ========================= */

  setActiveCv(id: string) {
    this.activeCvId = id;

    const item = this.cvResults.find((x) => x.id === id);
    if (!item) return;

    // push detail panel theo CV đang active
    this.matchSummary = item.summary;
    this.candidates = item.rows;
    this.selectedCandidate = item.firstRow;
    this.matchTags = item.firstRow?.tags || [];
    this.errorMessage = item.error;

    this.saveState();
    this.cdr.detectChanges();
  }

  get activeCv(): CvItem | null {
    return this.cvResults.find((x) => x.id === this.activeCvId) || null;
  }

  /* =========================
     BUILD UI FROM RESPONSE
  ========================= */

  private buildUiFromUploadResponse(res: any) {
    // batch item có thể bọc payload theo field
    const matchResult = res?.matchResult || res?.data?.matchResult || {};
    const summaryRaw = matchResult?.candidateSummary || {};
    const matches: any[] = Array.isArray(matchResult?.matches) ? matchResult.matches : [];

    const summary: AiMatchSummary = {
      mainSkills: summaryRaw.mainSkills || [],
      mainDomains: summaryRaw.mainDomains || [],
      seniority: summaryRaw.seniority || '',
    };

    if (!matches.length) {
      return {
        rows: [],
        summary,
        firstRow: null,
        error: 'AI chưa tìm được vị trí phù hợp cho CV này.',
      };
    }

    const filtered = matches
      .slice()
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .filter((m) => (m.score ?? 0) >= 10);

    if (!filtered.length) {
      return {
        rows: [],
        summary,
        firstRow: null,
        error: 'Không có vị trí nào đạt mức phù hợp tối thiểu (≥ 10%).',
      };
    }

    const name =
      res?.candidate?.email ||
      res?.candidate?.fullName ||
      res?.data?.candidate?.email ||
      res?.data?.candidate?.fullName ||
      'Ứng viên đã upload';

    const rows: CandidateRow[] = filtered.map((m) => {
      const score = m.score ?? 0;
      const status = this.mapStatus(m.label, score);

      return {
        name,
        recommendedJob: `${m.jobTitle} (${m.jobCode})`,
        matchScore: score,
        status,
        tags: this.buildTags(summary, status, score),
      };
    });

    return { rows, summary, firstRow: rows[0], error: null };
  }

  private buildTags(summary: AiMatchSummary, status: CandidateStatus, score: number): string[] {
    const safeSeniority = this.displaySeniority(summary.seniority || '', status, score);

    return [
      ...(summary.mainSkills?.length ? [`Kỹ năng: ${summary.mainSkills.slice(0, 3).join(', ')}`] : []),
      ...(summary.mainDomains?.length ? [`Lĩnh vực: ${summary.mainDomains.join(', ')}`] : []),
      `Cấp độ: ${this.seniorityLabel(safeSeniority)}`,
    ];
  }

  /* =========================
     LOAD FROM DB (cũ)
  ========================= */

  private loadAiResultFromDb(candidateId: string) {
    this.isLoadingFromDb = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.cvApi.getCandidateById(candidateId).subscribe({
      next: (candidate) => {
        this.isLoadingFromDb = false;

        if (!candidate) {
          this.resetUi('Không tìm thấy candidate trong DB.');
          return;
        }

        const mr = candidate.matchResult;
        if (!mr?.matches?.length) {
          this.resetUi('Candidate này chưa có kết quả AI (matchResult rỗng).');
          return;
        }

        const summaryRaw = mr.candidateSummary || {};
        const summary: AiMatchSummary = {
          mainSkills: summaryRaw.mainSkills || [],
          mainDomains: summaryRaw.mainDomains || [],
          seniority: summaryRaw.seniority || '',
        };
        this.matchSummary = summary;

        const rows: CandidateRow[] = mr.matches
          .slice()
          .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
          .map((m: any) => {
            const score = m.score ?? 0;
            const status = this.mapStatus(m.label, score);

            return {
              name: candidate.email || candidate.fullName || 'Ứng viên',
              recommendedJob: `${m.jobTitle} (${m.jobCode})`,
              matchScore: score,
              status,
              tags: this.buildTags(summary, status, score),
            };
          });

        this.candidates = rows;
        this.selectedCandidate = rows[0];
        this.matchTags = rows[0]?.tags || [];

        // ✅ cũng tạo cvResults ảo 1 item để bạn vẫn dùng filter UI
        const fake: CvItem = {
          id: this.makeId(),
          fileName: candidate.email || candidate.fullName || 'Candidate từ DB',
          ok: true,
          message: null,
          raw: candidate,
          rows,
          summary,
          firstRow: rows[0],
          error: null,
        };
        this.cvResults = [fake];
        this.activeCvId = fake.id;

        this.saveState();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingFromDb = false;
        this.resetUi(err?.error?.message || 'Không load được candidate từ server.');
      },
    });
  }

  private resetUi(message: string) {
    this.errorMessage = message;

    this.cvResults = [];
    this.activeCvId = null;

    this.candidates = [];
    this.selectedCandidate = null;
    this.matchTags = [];
    this.matchSummary = null;

    this.saveState();
    this.cdr.detectChanges();
  }

  onSelectCandidate(candidate: CandidateRow) {
    this.selectedCandidate = candidate;
    this.matchTags = candidate.tags;
    this.saveState();
  }

  /* =========================
     MAPPING
  ========================= */

  private mapStatus(label: string, score: number): CandidateStatus {
    const normalized = (label || '').toLowerCase();
    if (normalized.includes('not') || normalized.includes('reject')) return 'NotFit';
    if (normalized.includes('potential')) return 'Potential';
    if (score >= 75) return 'Suitable';
    if (score >= 50) return 'Potential';
    return 'NotFit';
  }

  statusLabel(status: CandidateStatus | string): string {
    const map: Record<string, string> = {
      Suitable: 'Phù hợp',
      Potential: 'Tiềm năng',
      NotFit: 'Chưa phù hợp',
    };
    return map[String(status)] || String(status);
  }

  seniorityLabel(value: string): string {
    const v = (value || '').trim();
    const map: Record<string, string> = {
      Junior: 'Junior (Mới)',
      Mid: 'Middle (Có kinh nghiệm)',
      Senior: 'Senior (Chuyên sâu)',
      Lead: 'Lead (Trưởng nhóm)',
      Unknown: 'Chưa xác định',
    };
    return map[v] || v || 'Chưa xác định';
  }

  private displaySeniority(rawSeniority: string, status: CandidateStatus, score: number): string {
    const s = (rawSeniority || '').trim();
    if ((status === 'Potential' || status === 'NotFit') && s === 'Lead') return 'Mid';
    if (status === 'NotFit' && s === 'Senior') return 'Mid';
    return s || 'Unknown';
  }

  /* =========================
     UTIL
  ========================= */
  private makeId() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
  }
}
