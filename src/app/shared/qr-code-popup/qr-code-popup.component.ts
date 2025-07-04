import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeService } from '../../services/qr-code.service';
import { WhatsAppStatusService, WhatsAppStatus } from '../../services/whatsapp-status.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-qr-code-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-code-popup.component.html',
  styleUrls: ['./qr-code-popup.component.scss']
})
export class QRCodePopupComponent implements OnInit, OnDestroy {
  qrCodeData: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  isVisible: boolean = false;
  whatsappStatus: WhatsAppStatus | null = null;
  isPolling: boolean = false;
  private statusSubscription: Subscription | null = null;
  private statusCheckTimeout: any = null;

  constructor(
    private qrCodeService: QRCodeService,
    private statusService: WhatsAppStatusService
  ) {}

  ngOnInit() {
    // Subscribe to status updates
    this.statusSubscription = this.statusService.status$.subscribe(
      status => {
        this.whatsappStatus = status;
        this.isPolling = this.statusService.isPollingActive();
        // If status becomes ready, we can close the popup
        if (status?.isReady && this.isVisible) {
          setTimeout(() => {
            this.hidePopup();
          }, 2000); // Close after 2 seconds when ready
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  showPopup() {
    this.isVisible = true;
    this.loadQRCode();
    // Start a 30-second timer to check status once
    if (this.statusCheckTimeout) {
      clearTimeout(this.statusCheckTimeout);
    }
    this.statusCheckTimeout = setTimeout(() => {
      this.statusService.refreshStatus().subscribe(status => {
        if (status?.isReady) {
          this.hidePopup();
        }
      });
    }, 30000);
  }

  hidePopup() {
    this.isVisible = false;
    this.qrCodeData = '';
    this.errorMessage = '';
    // Clear the status check timer if popup is closed manually
    if (this.statusCheckTimeout) {
      clearTimeout(this.statusCheckTimeout);
      this.statusCheckTimeout = null;
    }
    // Don't stop polling when popup is closed - keep it running in background
  }

  loadQRCode() {
    this.isLoading = true;
    this.errorMessage = '';

    this.qrCodeService.getQRCode().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.qrCodeData = response.qrCode;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load QR code. Please try again.';
      }
    });
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.hidePopup();
    }
  }

  getStatusText(): string {
    if (!this.whatsappStatus) return 'Checking status...';
    return this.whatsappStatus.isReady ? 'WhatsApp is ready!' : 'Waiting for WhatsApp connection...';
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
      return `Last checked ${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Last checked ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Last checked ${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
  }

  getPollingStatusText(): string {
    const interval = this.statusService.getPollingInterval() / 1000;
    return `Checking status every ${interval} seconds`;
  }
} 