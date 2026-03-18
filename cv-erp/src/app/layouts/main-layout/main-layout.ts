import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,   // <-- rất quan trọng
    HeaderComponent     // <-- rất quan trọng
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
})
export class MainLayoutComponent {
  isSidebarCollapsed = false;

  constructor(private router: Router) { }

  // nhận trạng thái thu gọn từ sidebar
  onSidebarCollapsedChange(value: boolean) {
    this.isSidebarCollapsed = value;
  }

  // bị gọi khi Header emit sự kiện logout
  logout() {
    // TODO: xoá token nếu có
    // localStorage.removeItem('token');

    this.router.navigate(['/login']); // đổi path nếu trang login của bạn khác
  }
}
