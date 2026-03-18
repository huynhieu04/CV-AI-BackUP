import { Component, EventEmitter, HostListener, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalSearchService } from '../../services/global-search.service';
import { AuthService } from '../../services/auth'; // ✅ THÊM

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent implements OnInit {
  isUserMenuOpen = false;
  searchTerm = '';

  displayName = 'User';
  greetingName = 'User';
  email = '—';
  avatarText = 'U';

  @Output() logout = new EventEmitter<void>();

  constructor(
    private globalsearch: GlobalSearchService,
    private auth: AuthService // ✅ THÊM
  ) { }

  ngOnInit() {
    this.searchTerm = this.globalsearch.currentTerm;

    // ✅ LẤY USER ĐÚNG KEY (cv_ai_user) thông qua AuthService
    const u = this.auth.getCurrentUser();
    if (!u) return;

    this.displayName = u.name || u.username || 'User';
    this.greetingName = u.username || (u.role === 'ADMIN' ? 'Admin' : 'HR');
    this.email = u.email || '—';

    const base = (u.name || u.username || 'U').trim();
    this.avatarText = base
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map(x => x[0])
      .join('')
      .toUpperCase();
  }

  onHeaderSearchChange(value: string) {
    this.searchTerm = value;
    this.globalsearch.setTerm(value);
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.app-header__user') && !target.closest('.user-menu')) {
      this.isUserMenuOpen = false;
    }
  }

  onLogoutClick() {
    this.isUserMenuOpen = false;
    this.logout.emit();
  }
}
