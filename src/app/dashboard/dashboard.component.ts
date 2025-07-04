import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { AuthService } from '../auth.service';
import { DashboardService, DashboardStats } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  dashboardStats: DashboardStats = {
    registeredGroups: 0,
    sentMessages: 0,
    pendingMessages: 0,
    totalMembers: 0
  };

  loading = true;
  error = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    this.loading = true;
    this.error = '';

    this.dashboardService.getDashboardStats().subscribe({
      next: (stats: DashboardStats) => {
        this.dashboardStats = stats;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load dashboard statistics.';
        this.loading = false;
        console.error('Error loading dashboard stats:', err);
      }
    });
  }

  logout() {
    this.sidebar?.clearQRCodePopup();
    this.auth.logout();
  }

  showQRCodePopup() {
    if (this.sidebar) {
      this.sidebar.showQRCodePopup();
    }
  }
} 