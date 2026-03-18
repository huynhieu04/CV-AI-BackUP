import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // ✅ THÊM
  ) { }

  clearError() {
    this.error = '';
    this.cdr.detectChanges(); // ✅
  }

  onSubmit() {
    if (this.loading) return;

    this.error = '';
    const u = this.username.trim();

    if (!u || !this.password) {
      this.error = 'Vui lòng nhập đầy đủ thông tin.';
      this.cdr.detectChanges(); // ✅
      return;
    }

    this.loading = true;
    this.cdr.detectChanges(); // ✅

    this.auth.login(u, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges(); // ✅
        this.router.navigate(['/ai-classification']);
      },
      error: (err) => {
        this.loading = false;

        if (err?.status === 401) {
          this.error = err.error?.message || 'Sai username hoặc mật khẩu';
          this.password = '';
        } else if (err?.status === 0) {
          this.error = 'Không kết nối được server.';
        } else {
          this.error = 'Đăng nhập thất bại.';
        }

        this.cdr.detectChanges(); // 🔥 DÒNG QUYẾT ĐỊNH
      },
    });
  }
}
