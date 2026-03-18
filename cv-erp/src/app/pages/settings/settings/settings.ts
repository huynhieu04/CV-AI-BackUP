import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CvApiService } from '../../../services/cv-api.service';

type WeightKey = 'skills' | 'experience' | 'education' | 'languages';

interface AiWeightsPercent {
  skills: number;      // 0..100
  experience: number;  // 0..100
  education: number;   // 0..100
  languages: number;   // 0..100
}

interface FileFormats {
  pdf: boolean;
  doc: boolean;
  image: boolean;
}

interface AiSettingsVM {
  weights: AiWeightsPercent; // percent
  fileFormats: FileFormats;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  totalWeight = 100;

  // ✅ default % chẵn
  settings: AiSettingsVM = {
    weights: {
      skills: 40,
      experience: 30,
      education: 20,
      languages: 10,
    },
    // ✅ default tick cả 3
    fileFormats: {
      pdf: true,
      doc: true,
      image: true,
    },
  };

  constructor(private cvApi: CvApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadSettings();
  }

  private clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  // ✅ ép về số chẵn theo bước 10 (40/30/20/10)
  private roundToStep(n: number, step = 10) {
    return Math.round(n / step) * step;
  }

  private toPercent(ratio: number | undefined | null): number {
    const v = typeof ratio === 'number' ? ratio : 0;
    return this.clamp(this.roundToStep(v * 100, 10), 0, 100);
  }

  private toRatio(percent: number): number {
    const p = this.clamp(this.roundToStep(percent, 10), 0, 100);
    return p / 100;
  }

  private getTotalWeight(): number {
    const w = this.settings.weights;
    return (w.skills || 0) + (w.experience || 0) + (w.education || 0) + (w.languages || 0);
  }

  onWeightsChanged(_key: WeightKey) {
    // normalize mọi field về step=10 và clamp 0..100
    const w = this.settings.weights;
    (Object.keys(w) as WeightKey[]).forEach((k) => {
      w[k] = this.clamp(this.roundToStep(Number(w[k] ?? 0), 10), 0, 100);
    });

    this.totalWeight = this.getTotalWeight();
    this.cdr.markForCheck();
  }

  private loadSettings() {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.cvApi.getAiSettings().subscribe({
      next: (res) => {
        const api = res?.settings || res || {};

        this.settings = {
          weights: {
            skills: this.toPercent(api.weights?.skills ?? 0.4),
            experience: this.toPercent(api.weights?.experience ?? 0.3),
            education: this.toPercent(api.weights?.education ?? 0.2),
            languages: this.toPercent(api.weights?.languages ?? 0.1),
          },

          // ✅ map đúng field backend
          fileFormats: {
            pdf: api.allowedExtensions?.pdf === undefined ? true : !!api.allowedExtensions.pdf,
            doc: api.allowedExtensions?.doc === undefined ? true : !!api.allowedExtensions.doc,
            image: api.allowedExtensions?.image === undefined ? true : !!api.allowedExtensions.image,
          },
        };

        this.totalWeight = this.getTotalWeight();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Không tải được cấu hình.';
        this.cdr.markForCheck();
      },
    });
  }


  onSave() {
    this.totalWeight = this.getTotalWeight();
    if (this.totalWeight !== 100) {
      this.errorMessage = 'Tổng trọng số nên bằng 100%.';
      this.cdr.markForCheck();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload = {
      weights: {
        skills: this.toRatio(this.settings.weights.skills),
        experience: this.toRatio(this.settings.weights.experience),
        education: this.toRatio(this.settings.weights.education),
        languages: this.toRatio(this.settings.weights.languages),
      },
      // ✅ gửi đúng field backend
      allowedExtensions: {
        pdf: this.settings.fileFormats.pdf,
        doc: this.settings.fileFormats.doc,
        image: this.settings.fileFormats.image,
      },
    };

    this.cvApi.updateAiSettings(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Đã lưu cấu hình AI thành công.';
        this.cdr.markForCheck();

        // optional: tự ẩn sau 2s
        setTimeout(() => {
          this.successMessage = null;
          this.cdr.markForCheck();
        }, 2000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage =
          err?.error?.message || 'Có lỗi khi lưu cấu hình.';
        this.cdr.markForCheck();
      },
    });
  }

}
