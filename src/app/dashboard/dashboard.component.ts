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
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatFormFieldModule,MatInputModule,SidebarComponent,MatDatepickerModule,RouterModule,MatNativeDateModule,FormsModule,CommonModule
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
    totalMembers: 0
  };

  loading = true;
  error = '';
  startDate: Date = new Date(); // today's date
  endDate: Date = new Date();   // today's date
  selectedDate: string = "";


  constructor(
    private router: Router,
    private auth: AuthService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.loadDashboardStats();
  }
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: 'yyyy-MM-dd'
  }
  onDateChange(): void {
    console.log('Start:', this.startDate);
    console.log('End:', this.endDate);
  }
  applyDateFilter(): void {
    if (!this.startDate || !this.endDate) {
      alert('Please select both dates.');
      return;
    }
    // Apply filtering logic
    console.log('Applying date filter from', this.startDate, 'to', this.endDate);
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