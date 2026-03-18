import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';

import { CvApiService } from '../../../services/cv-api.service';
import { GlobalSearchService } from '../../../services/global-search.service';

type JobLevel = 'Intern' | 'Junior' | 'Middle' | 'Senior' | 'Manager' | '';
type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | '';

interface JobRow {
  _id?: string;
  code?: string;
  title: string;

  level?: JobLevel;
  type?: JobType;

  skillsRequired: string;
  experienceRequired: string;
  educationRequired: string;
  description: string;

  isActive?: boolean;
  createdAt?: string;
}

type ImportErrorRow = { row?: number | null; message: string };

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs.html',
  styleUrls: ['./jobs.scss'],
})
export class JobsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ===== FORM =====
  newJob: JobRow = this.emptyJob();

  jobs: JobRow[] = [];
  searchTerm = '';

  isLoading = false;
  isSaving = false;

  errorMessage: string | null = null;
  saveMessage: string | null = null;

  pageSize = 6;
  currentPage = 1;

  // ===== IMPORT (cách 2: chọn file -> bấm import) =====
  importing = false;
  excelFile: File | null = null;
  excelFileName = '';

  importMessage: string | null = null;
  importErrors: ImportErrorRow[] = [];

  constructor(
    private cvApi: CvApiService,
    private cdr: ChangeDetectorRef,
    private globalSearch: GlobalSearchService
  ) { }

  ngOnInit(): void {
    this.loadJobs();

    // ✅ nhớ unsubscribe
    this.globalSearch.term$
      .pipe(takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm = term || '';
        this.currentPage = 1;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== HELPERS =====
  private emptyJob(): JobRow {
    return {
      title: '',
      level: '',
      type: '',
      skillsRequired: '',
      experienceRequired: '',
      educationRequired: '',
      description: '',
    };
  }

  private normalizeJob(j: any): JobRow {
    return {
      _id: j?._id,
      code: j?.code,
      title: j?.title || '',

      level: (j?.level ?? '') as JobLevel,
      type: (j?.type ?? '') as JobType,

      skillsRequired: j?.skillsRequired || '',
      experienceRequired: j?.experienceRequired || '',
      educationRequired: j?.educationRequired || '',
      description: j?.description || '',

      isActive: j?.isActive ?? true,
      createdAt: j?.createdAt,
    };
  }

  // ===== LOAD LIST =====
  loadJobs() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.cvApi
      .getJobs() // service trả any[] rồi
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (list: any[]) => {
          this.jobs = (list || []).map((j) => this.normalizeJob(j));

          if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('[Jobs] loadJobs error', err);
          this.errorMessage =
            err?.error?.message ||
            'Không tải được danh sách JD từ server. Vui lòng kiểm tra backend.';
          this.cdr.markForCheck();
        },
      });
  }

  // ===== FILTER + PAGINATION =====
  private get filteredAll(): JobRow[] {
    const keyword = this.searchTerm.trim().toLowerCase();
    if (!keyword) return this.jobs;

    return this.jobs.filter((j) => {
      const code = (j.code || '').toLowerCase();
      const title = (j.title || '').toLowerCase();
      const level = (j.level || '').toLowerCase();
      const type = (j.type || '').toLowerCase();
      return (
        code.includes(keyword) ||
        title.includes(keyword) ||
        level.includes(keyword) ||
        type.includes(keyword)
      );
    });
  }

  get filteredJobs(): JobRow[] {
    const list = this.filteredAll;
    const start = (this.currentPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAll.length / this.pageSize));
  }

  goPrevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.markForCheck();
    }
  }

  goNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.markForCheck();
    }
  }

  // ===== CREATE =====
  onSaveJob() {
    if (!this.newJob.title?.trim()) {
      this.errorMessage = 'Vui lòng nhập Tên vị trí.';
      this.cdr.markForCheck();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.saveMessage = null;

    const payload = {
      title: this.newJob.title.trim(),
      level: this.newJob.level || '',
      type: this.newJob.type || '',
      skillsRequired: this.newJob.skillsRequired?.trim() || '',
      experienceRequired: this.newJob.experienceRequired?.trim() || '',
      educationRequired: this.newJob.educationRequired?.trim() || '',
      description: this.newJob.description?.trim() || '',
    };

    this.cvApi
      .createJob(payload)
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          const j = res?.job || res;
          this.saveMessage = 'Tạo Job thành công.';

          if (j && j._id) {
            this.jobs = [this.normalizeJob(j), ...this.jobs];
          } else {
            this.loadJobs();
          }

          this.newJob = this.emptyJob();
          this.currentPage = 1;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('[Jobs] createJob error', err);
          this.errorMessage =
            err?.error?.message || 'Không tạo được Job. Vui lòng thử lại.';
          this.cdr.markForCheck();
        },
      });
  }

  // ===== DELETE =====
  onDeleteJob(job: JobRow) {
    if (!job._id) return;

    const label = job.code ? `${job.code} - ${job.title}` : job.title;
    const ok = window.confirm(`Bạn có chắc muốn xoá JD "${label}"?`);
    if (!ok) return;

    this.cvApi
      .deleteJob(job._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.jobs = this.jobs.filter((j) => j._id !== job._id);
          if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('[Jobs] delete job error', err);
          this.errorMessage = 'Không xoá được JD. Vui lòng thử lại.';
          this.cdr.markForCheck();
        },
      });
  }

  // ===== IMPORT EXCEL (cách 2) =====
  onPickExcel(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    this.excelFile = file;
    this.excelFileName = file?.name || '';

    // reset message
    this.importMessage = null;
    this.importErrors = [];
    this.errorMessage = null;

    // reset input để chọn lại cùng 1 file vẫn trigger change
    input.value = '';

    this.cdr.markForCheck();
  }

  importExcel() {
    if (!this.excelFile || this.importing) return;

    this.importing = true;
    this.importMessage = null;
    this.importErrors = [];
    this.errorMessage = null;

    this.cvApi
      .importJobsExcel(this.excelFile)
      .pipe(
        finalize(() => {
          this.importing = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          // ✅ hỗ trợ nhiều format response
          const inserted =
            res?.inserted ??
            res?.insertedCount ??
            res?.created ??
            0;

          const failed =
            res?.failed ??
            res?.failedCount ??
            (Array.isArray(res?.errors) ? res.errors.length : 0) ??
            0;

          this.importErrors = Array.isArray(res?.errors)
            ? (res.errors as ImportErrorRow[])
            : [];

          this.importMessage = `Import xong: +${inserted} JD, lỗi ${failed}.`;

          // reload list để thấy code tự sinh
          this.loadJobs();

          // clear file
          this.excelFile = null;
          this.excelFileName = '';
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('[Jobs] importExcel error', err);

          this.importErrors = Array.isArray(err?.error?.errors)
            ? err.error.errors
            : [];

          this.errorMessage =
            err?.error?.message || 'Import thất bại. Vui lòng kiểm tra file.';
          this.cdr.markForCheck();
        },
      });
  }

  // ===== TEMPLATE DOWNLOAD (CSV) =====
  downloadTemplate() {
    const header = [
      'title',
      'level',
      'type',
      'skillsRequired',
      'experienceRequired',
      'educationRequired',
      'description',
      'isActive',
    ];

    const sample = [
      [
        'Software Engineer (Web)',
        'Junior',
        'Full-time',
        'Angular, Node.js, MongoDB, REST API, Git',
        '0-1 year',
        'IT / CS Degree',
        'Build web features, integrate APIs...',
        'true',
      ],
    ];

    const csv =
      header.join(',') +
      '\n' +
      sample
        .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobs_template.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  // ===== LABELS =====
  getLevelLabel(level?: JobLevel) {
    return level || '—';
  }
  getTypeLabel(type?: JobType) {
    return type || '—';
  }
}
