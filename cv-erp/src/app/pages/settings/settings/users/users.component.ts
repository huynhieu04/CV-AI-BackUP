import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersApiService, AppUser, Role } from '../../../../services/users-api.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
    username = '';
    password = '';
    name = '';
    email = '';
    role: Role = 'HR';

    users: AppUser[] = [];
    loading = false;
    saving = false;
    error = '';

    editingId: string | null = null;
    editName = '';
    editEmail = '';
    editRole: Role = 'HR';

    constructor(private api: UsersApiService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.reload();
    }

    reload() {
        if (this.loading) return;

        this.loading = true;
        this.error = '';
        this.cdr.detectChanges(); // ✅ show loading ngay

        this.api.list()
            .pipe(finalize(() => {
                this.loading = false;
                this.cdr.detectChanges(); // ✅ tắt loading ngay
            }))
            .subscribe({
                next: (users) => {
                    this.users = [...users]; // ✅ đổi reference
                    this.cdr.detectChanges(); // ✅ render list ngay (fix “click mới ra”)
                },
                error: (err) => {
                    this.error = err?.error?.message || 'Không tải được danh sách user.';
                    this.cdr.detectChanges();
                },
            });
    }

    createUser() {
        if (this.saving) return;

        const u = this.username.trim();
        const n = this.name.trim();
        const e = this.email.trim();

        if (!u || !this.password || !n || !e) {
            this.error = 'Vui lòng nhập đủ Username, Password, Name, Email.';
            this.cdr.detectChanges();
            return;
        }

        this.saving = true;
        this.error = '';
        this.cdr.detectChanges();

        this.api.create({ username: u, password: this.password, name: n, email: e, role: this.role })
            .pipe(finalize(() => {
                this.saving = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (newUser) => {
                    // ✅ cập nhật list NGAY, khỏi đợi reload (mượt hơn)
                    this.users = [newUser, ...this.users];

                    // reset form
                    this.username = '';
                    this.password = '';
                    this.name = '';
                    this.email = '';
                    this.role = 'HR';

                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.error = err?.error?.message || 'Tạo user thất bại.';
                    this.cdr.detectChanges();
                },
            });
    }

    startEdit(u: AppUser) {
        this.editingId = u.id;
        this.editName = u.name;
        this.editEmail = u.email;
        this.editRole = u.role;
        this.cdr.detectChanges();
    }

    cancelEdit() {
        this.editingId = null;
        this.cdr.detectChanges();
    }

    saveEdit(id: string) {
        this.saving = true;
        this.error = '';
        this.cdr.detectChanges();

        this.api.update(id, {
            name: this.editName.trim(),
            email: this.editEmail.trim(),
            role: this.editRole,
        })
            .pipe(finalize(() => {
                this.saving = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (updated) => {
                    this.users = this.users.map(u => u.id === updated.id ? updated : u);
                    this.editingId = null;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.error = err?.error?.message || 'Cập nhật thất bại.';
                    this.cdr.detectChanges();
                },
            });
    }

    deleteUser(id: string) {
        if (!confirm('Bạn chắc chắn muốn xoá user này?')) return;

        this.api.delete(id).subscribe({
            next: () => {
                this.users = this.users.filter(u => u.id !== id);
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.error = err?.error?.message || 'Xoá thất bại.';
                this.cdr.detectChanges();
            },
        });
    }

    formatDate(iso: string) {
        try { return new Date(iso).toLocaleString(); } catch { return iso; }
    }
}
