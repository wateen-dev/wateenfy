import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { AuthService } from '../auth.service';
import { DashboardService, DashboardStats } from './dashboard.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent,RouterModule,FormsModule],
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
startDate: string = '';
endDate: string = '';


  constructor(
    private router: Router,
    private auth: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
    const today = this.getTodayDate();
    this.startDate = today;
    this.endDate = today;
  }
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: 'yyyy-MM-dd'
  }
  onDateChange(): void {
    // Optional: Auto trigger filtering or validation here
    console.log('Date changed:', this.startDate, this.endDate);
  }

applyDateFilter(): void {
  if (this.startDate && this.endDate) {
    console.log('Filtering from', this.startDate, 'to', this.endDate);
    // TODO: call API or filter logic here
  } else {
    alert('Please select both start and end dates.');
  }
}
openDatePicker(el: HTMLInputElement): void {
  debugger
  // Chrome ≥114, Edge ≥114 support showPicker()
  // Fallback to .focus() to open the picker on most other desktop browsers
  if ((el as any).showPicker) {
    (el as any).showPicker();
  } else {
    el.focus();          // Safari / Firefox will show the picker on focus
    el.click();          // fallback for older Chromium versions
  }
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
  goToGroups() {
    this.router.navigate(['/whatsapp/list-groups']);
  }
  // goToLogs() {
  //   this.router.navigate(['/logs']);
  // }
  goToLogs(tab: 'sent' | 'received' | 'failed' = 'sent'): void {
  this.router.navigate(
    ['/logs'],
    { queryParams: { tab } }        // ⬅️  passes “sent”, “received”, …
  );
}

  goToSearchMemberPage(){
    this.router.navigate(['/whatsapp/search-member']);
  }
  logout() {
    this.sidebar?.clearQRCodePopup();
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  showQRCodePopup() {
    if (this.sidebar) {
      this.sidebar.showQRCodePopup();
    }
  }
  
} 