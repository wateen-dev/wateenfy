import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { MessageLogsService, MessageLog, MessageLogsResponse } from './message-logs.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
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
  // Pagination
 // Pagination for message logs
logCurrentPage: number = 1;
logItemsPerPage: number = 35;
paginatedLogs: MessageLog[] = [];

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

  constructor(private messageLogsService: MessageLogsService,private route: ActivatedRoute) {}

  ngOnInit() {
    this.loadMessageLogs();
    this.route.queryParams.subscribe(params => {
    this.activeTab = params['tab'] || 'all';
    this.onStatusTabClick(this.activeTab);
  });
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

  // applyFilters() {
  //   let filtered = [...this.messageLogs];

  //   // Filter by status
  //   if (this.statusType !== 'all') {
  //     filtered = filtered.filter(log => 
  //       log.status.toUpperCase() === this.statusType.toUpperCase()
  //     );
  //   }

  //   // Filter by search term
  //   if (this.searchTerm.trim()) {
  //     const search = this.searchTerm.toLowerCase();
  //     filtered = filtered.filter(log =>
  //       log.message.toLowerCase().includes(search) ||
  //       log.session_id.includes(search) ||
  //       log.group_name.toLowerCase().includes(search)
  //     );
  //   }

  //   // Filter by date range
  //   if (this.startDate) {
  //     const startDate = new Date(this.startDate);
  //     filtered = filtered.filter(log => 
  //       new Date(log.created_at) >= startDate
  //     );
  //   }

  //   if (this.endDate) {
  //     const endDate = new Date(this.endDate);
  //     endDate.setHours(23, 59, 59, 999); // End of day
  //     filtered = filtered.filter(log => 
  //       new Date(log.created_at) <= endDate
  //     );
  //   }

  //   this.filteredLogs = filtered;
  // }
  applyFilters() {
  let filtered = [...this.messageLogs];

  // Existing filters
  if (this.statusType !== 'all') {
    filtered = filtered.filter(log =>
      log.status.toUpperCase() === this.statusType.toUpperCase()
    );
  }

  if (this.searchTerm.trim()) {
    const search = this.searchTerm.toLowerCase();
    filtered = filtered.filter(log =>
      log.message.toLowerCase().includes(search) ||
      log.session_id.includes(search) ||
      log.group_name.toLowerCase().includes(search)
    );
  }

  if (this.startDate) {
    const start = new Date(this.startDate);
    filtered = filtered.filter(log =>
      new Date(log.created_at) >= start
    );
  }

  if (this.endDate) {
    const end = new Date(this.endDate);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter(log =>
      new Date(log.created_at) <= end
    );
  }

  this.filteredLogs = filtered;
  this.logCurrentPage = 1;
  this.updatePaginatedLogs();
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
get logTotalPages(): number {
  return Math.ceil(this.filteredLogs.length / this.logItemsPerPage);
}

changeLogPage(page: number) {
  if (page < 1 || page > this.logTotalPages) return;
  this.logCurrentPage = page;
  this.updatePaginatedLogs();
}

updatePaginatedLogs() {
  const start = (this.logCurrentPage - 1) * this.logItemsPerPage;
  const end = start + this.logItemsPerPage;
  this.paginatedLogs = this.filteredLogs.slice(start, end);
}
  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredLogs);
  
    // 1. Auto-size column widths based on max content length
    const objectMaxLength: number[] = [];
    const keys = Object.keys(this.filteredLogs[0] || {});
  
    keys.forEach((key, i) => {
      const maxLength = Math.max(
        key.length,
        ...this.filteredLogs.map(obj =>
          (obj as any)[key] ? (obj as any)[key].toString().length : 0
        )
      );
      objectMaxLength[i] = maxLength;
    });
  
    worksheet['!cols'] = objectMaxLength.map(width => ({ wch: width + 5 }));
  
    // 2. Make header row bold
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || '');
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: 'center' }
      };
    }
  
    // 3. Freeze the top row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
  
    // 4. Create workbook and export
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Sheet1': worksheet },
      SheetNames: ['Sheet1']
    };
  
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true
    });
  
    const fileName = 'MessageLogs.xlsx';
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, fileName);
  }
}
