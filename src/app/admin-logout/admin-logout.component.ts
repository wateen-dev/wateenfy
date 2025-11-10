import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-logout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './admin-logout.component.html',
  styleUrl: './admin-logout.component.css'
})
export class AdminLogoutComponent {
  constructor(
    private router: Router,
    private auth: AuthService,
    private dashboardService: DashboardService
  ) {}


 logout() {
    this.auth.logoutAdmin();
    this.router.navigate(['/login']);
  }
 showConfirmModal = false;
  logoutInput = '';

  openLogoutConfirmation() {
    this.logoutInput = '';
    this.showConfirmModal = true;
  }

  cancelLogout() {
    this.showConfirmModal = false;
  }

  confirmLogout() {
    if (this.logoutInput.trim().toLowerCase() === 'logout') {
      this.showConfirmModal = false;
      this.logout(); // Call your actual logout method
    }
  }
}
