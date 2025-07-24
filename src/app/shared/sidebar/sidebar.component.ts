import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../auth.service';
import { QRCodePopupComponent } from '../qr-code-popup/qr-code-popup.component';
import { WhatsAppStatusService, WhatsAppStatus } from '../../services/whatsapp-status.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone_number: string;
  status: string;
  created_at: string;
  deleted_at: string | null;
  is_deleted: string | null;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, QRCodePopupComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  whatsappMenuOpen = false;
  user: User | null = null;
  whatsappStatus: WhatsAppStatus | null = null;
  isPolling: boolean = false;
  private statusSubscription: Subscription | null = null;

  @ViewChild('whatsappMenuHeader', { static: true }) whatsappMenuHeader!: ElementRef;
  @ViewChild(QRCodePopupComponent) qrPopup!: QRCodePopupComponent;

  constructor(
    private auth: AuthService,
    private router: Router,
    private el: ElementRef,
    private statusService: WhatsAppStatusService
  ) {}

  ngOnInit() {
    debugger
    this.user = this.auth.getUser();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.whatsappMenuOpen = event.urlAfterRedirects.startsWith('/whatsapp');
    });

    // Subscribe to WhatsApp status updates
    this.statusSubscription = this.statusService.status$.subscribe(
      status => {
        this.whatsappStatus = status;
        this.isPolling = this.statusService.isPollingActive();
        console.log('Sidebar received status update:', status);
      }
    );

    // Ensure polling is active
    if (!this.statusService.isPollingActive()) {
      this.statusService.startBackgroundPolling();
    }
  }
onCreateGroupClick(event: MouseEvent): void {
  if (!this.isWhatsAppReady()) {
    event.preventDefault(); // Prevent default anchor behavior
    event.stopPropagation(); // Prevent event bubbling
    // Optional: show toast/snackbar
  }
}
onAddMemberClick(event: MouseEvent): void {
  if (!this.isWhatsAppReady()) {
    event.preventDefault();
    event.stopPropagation();
    // Optional: show notification or toast
  }
}

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  toggleWhatsappMenu(event: Event) {
    this.whatsappMenuOpen = !this.whatsappMenuOpen;
  }

  getInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  showQRCodePopup() {
    if (this.qrPopup) {
      this.qrPopup.showPopup();
    }
    // Manually refresh status when opening QR popup
    this.refreshStatus();
  }

  refreshStatus() {
    this.statusService.refreshStatus().subscribe(
      status => {
        console.log('Manual status refresh:', status);
      },
      error => {
        console.error('Error refreshing status:', error);
      }
    );
  }

  isWhatsAppReady(): boolean {
    return this.whatsappStatus?.isReady || false;
  }

  getStatusText(): string {
    if (!this.whatsappStatus) return 'Checking WhatsApp...';
    return this.whatsappStatus.isReady ? 'WhatsApp Ready' : 'WhatsApp Not Connected';
  }

  getStatusClass(): string {
    if (!this.whatsappStatus) return 'status-checking';
    return this.whatsappStatus.isReady ? 'status-ready' : 'status-waiting';
  }

  getLastCheckedText(): string {
    if (!this.whatsappStatus?.lastChecked) return '';
    const now = new Date();
    const lastChecked = new Date(this.whatsappStatus.lastChecked);
    const diffInSeconds = Math.floor((now.getTime() - lastChecked.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
  }

  getPollingStatusText(): string {
    const interval = this.statusService.getPollingInterval() / 1000;
    return `Every ${interval}s`;
  }

  clearQRCodePopup() {
    if (this.qrPopup) {
      this.qrPopup.hidePopup();
    }
  }
}
