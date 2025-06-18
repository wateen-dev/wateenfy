import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { MessageLogsService, MessageLog, MessageLogsResponse } from './message-logs.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-logs',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './message-logs.component.html',
  styleUrls: ['./message-logs.component.scss']
})
export class MessageLogsComponent implements OnInit {
  messageLogs: MessageLog[] = [];
  filteredLogs: MessageLog[] = [];
  loading = true;
  error = '';
  
  // Filter properties
  startDate = '';
  endDate = '';
  statusType = 'all';
  searchTerm = '';
  
  // Status counts
  statusCounts = {
    all: 0,
    sent: 0,
    pending: 0,
    failed: 0
  };
  
  activeTab = 'all';

  constructor(private messageLogsService: MessageLogsService) {}

  ngOnInit() {
    this.loadMessageLogs();
  }

  loadMessageLogs() {
    this.loading = true;
    this.error = '';
    
    this.messageLogsService.getAllMessages().subscribe({
      next: (response: MessageLogsResponse) => {
        this.messageLogs = response.data;
        this.calculateStatusCounts();
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load message logs. Please try again.';
        this.loading = false;
        console.error('Error loading message logs:', err);
      }
    });
  }

  calculateStatusCounts() {
    this.statusCounts = {
      all: this.messageLogs.length,
      sent: this.messageLogs.filter(log => log.status.toUpperCase() === 'SENT').length,
      pending: this.messageLogs.filter(log => log.status.toUpperCase() === 'PENDING').length,
      failed: this.messageLogs.filter(log => log.status.toUpperCase() === 'FAILED').length
    };
  }

  applyFilters() {
    let filtered = [...this.messageLogs];

    // Filter by status
    if (this.statusType !== 'all') {
      filtered = filtered.filter(log => 
        log.status.toUpperCase() === this.statusType.toUpperCase()
      );
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(search) ||
        log.session_id.includes(search) ||
        log.group_name.toLowerCase().includes(search)
      );
    }

    // Filter by date range
    if (this.startDate) {
      const startDate = new Date(this.startDate);
      filtered = filtered.filter(log => 
        new Date(log.created_at) >= startDate
      );
    }

    if (this.endDate) {
      const endDate = new Date(this.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(log => 
        new Date(log.created_at) <= endDate
      );
    }

    this.filteredLogs = filtered;
  }

  onStatusTabClick(status: string) {
    this.activeTab = status;
    this.statusType = status;
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  onDateChange() {
    this.applyFilters();
  }

  onStatusTypeChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.startDate = '';
    this.endDate = '';
    this.statusType = 'all';
    this.searchTerm = '';
    this.activeTab = 'all';
    this.applyFilters();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'sent':
        return 'green';
      case 'pending':
        return 'orange';
      case 'failed':
        return 'red';
      default:
        return 'yellow';
    }
  }
}
