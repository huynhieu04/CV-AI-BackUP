// src/app/pages/reports/reports/reports.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CvApiService } from '../../../services/cv-api.service';

interface ReportsOverview {
  totalCv: number;
  suitable: number;
  potential: number;
  notFit: number;
  suitablePercent: number;
  potentialPercent: number;
  notFitPercent: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss'],
})
export class ReportsComponent implements OnInit {
  overview: ReportsOverview | null = null;

  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private cvApi: CvApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadOverview();
  }

  loadOverview() {
    this.isLoading = true;
    this.errorMessage = null;

    this.cvApi.getOverviewReport().subscribe({
      next: (res: any) => {
        this.overview = {
          totalCv: res.totalCv ?? res.total ?? 0,
          suitable: res.suitable ?? 0,
          potential: res.potential ?? 0,
          notFit: res.notFit ?? 0,
          suitablePercent: res.suitablePercent ?? res.suitablePct ?? 0,
          potentialPercent: res.potentialPercent ?? res.potentialPct ?? 0,
          notFitPercent: res.notFitPercent ?? res.notFitPct ?? 0,
        };

        this.isLoading = false;
        // ép Angular render lại ngay, không chờ tới khi user click
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Reports] loadOverview error', err);
        this.errorMessage =
          'Không tải được dữ liệu báo cáo. Kiểm tra backend /api/reports/summary.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
