import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { AuthService } from '../auth.service';
import { DashboardService, DashboardStats } from './dashboard.service';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { WhatsAppStatusService } from '../services/whatsapp-status.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, SidebarComponent, MatDatepickerModule, RouterModule, MatNativeDateModule, FormsModule, CommonModule,MatIconModule
  ],
  // providers: [
  //   { provide: DateAdapter, useClass: NativeDateAdapter }, // ✅ Fixes the missing DateAdapter error
  //   { provide: MAT_DATE_LOCALE, useValue: 'en-GB' } // Optional: you can use 'en-US' or others
  // ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  dashboardStats: DashboardStats = {
    registeredGroups: 0,
    sentMessages: 0,
    pendingMessages: 0,
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    invited: 0,
    pending: 0
  };

  loading = true;
  loadingNew = true;
  error = '';
  errorMessage = '';
  startDate: Date = new Date(); // today's date
  endDate: Date = new Date();   // today's date
  selectedDate: string = "";
  sentCount = 0;
  failedCount = 0;

  constructor(
    private router: Router,
    private auth: AuthService,
    private dashboardService: DashboardService,
    private whatsAppStatusService: WhatsAppStatusService
  ) { }

  ngOnInit() {
    const today = new Date();
    const startDate = this.formatDate(today); // use today's date or subtract days if needed
    const endDate = this.formatDate(today);   // can be same as startDate for single-day stats
    this.loadDashboardStats();
    debugger
    this.GetMessageStats(startDate, endDate);
  }
  refreshStatusManually(): void {
  this.whatsAppStatusService.refreshStatus().subscribe({
    next: (status) => {
      console.log('Manual refresh status:', status);
    },
    error: (err) => {
      console.error('Manual refresh failed:', err);
    }
  });
}

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

 onDateChange(): void {
  debugger
    // this.errorMessage = ''
  const formattedStartDate = this.formatDate(this.startDate);
  const formattedEndDate = this.formatDate(this.endDate);
  if (!this.startDate || !this.endDate) {
    this.errorMessage = 'Both start and end dates are required.';
    return;
  }

  if ( formattedStartDate > formattedEndDate) {
    this.errorMessage = 'Start date cannot be greater than end date.';
    return;
  }


  this.GetMessageStats(formattedStartDate, formattedEndDate);
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
  GetMessageStats(startDate: string, endDate: string): void {
    this.loadingNew = true;
    this.errorMessage = '';

    this.dashboardService.getMessageStats('sent', startDate, endDate).subscribe({
      next: (sentRes: any) => {
        if (sentRes.data.length == 0) {
          this.dashboardStats.sentMessages = this.sentCount;
        }
        else {
          this.sentCount = sentRes.data.length;
          this.dashboardStats.sentMessages = this.sentCount
        }
        // Now fetch pending messages after sent
        this.dashboardService.getMessageStats('pending', startDate, endDate).subscribe({
          next: (pendingRes: any) => {
            debugger
            if (pendingRes.data.length == 0) {
              this.dashboardStats.pendingMessages = this.failedCount;
            }
            else {
              this.failedCount = pendingRes.data.length;
              this.dashboardStats.pendingMessages = this.failedCount
            }
            console.log('Pending Messages:', this.dashboardStats.pendingMessages);
            this.loadingNew = false;
          },
          error: (err) => {
            this.errorMessage = 'Failed to load pending message stats.';
            this.loadingNew = false;
            console.error('Error loading pending stats:', err);
          }
        });

      },
      error: (err) => {
        this.errorMessage = 'Failed to load sent message stats.';
        this.loadingNew = false;
        console.error('Error loading sent stats:', err);
      }
    });

  }
  goToGroups() {
    this.router.navigate(['/whatsapp/list-groups']);
  }
  // goToLogs() {
  //   this.router.navigate(['/logs']);
  // }
  goToLogs(tab: 'sent' | 'received' | 'pending' = 'sent'): void {
    this.router.navigate(
      ['/logs'],
      { queryParams: { tab } }        // ⬅️  passes “sent”, “received”, …
    );
  }

  goToSearchMemberPage() {
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