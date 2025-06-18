import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import { switchMap, catchError, tap, map } from 'rxjs/operators';
import { QRCodeService } from './qr-code.service';

export interface WhatsAppStatus {
  sessionId: string;
  isReady: boolean;
  lastChecked: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppStatusService {
  private statusSubject = new BehaviorSubject<WhatsAppStatus | null>(null);
  private isPolling = false;
  private pollingInterval = 30000; // Check every 30 seconds
  private pollingSubscription: any = null;

  public status$ = this.statusSubject.asObservable();

  constructor(private qrCodeService: QRCodeService) {
    // Start polling automatically when service is created
    this.startBackgroundPolling();
  }

  getCurrentStatus(): WhatsAppStatus | null {
    return this.statusSubject.value;
  }

  isReady(): boolean {
    const status = this.statusSubject.value;
    return status?.isReady || false;
  }

  // Start background polling (runs continuously)
  startBackgroundPolling(): void {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.checkStatus().subscribe(); // Initial check
    
    this.pollingSubscription = interval(this.pollingInterval).pipe(
      switchMap(() => this.checkStatus())
    ).subscribe();
    
    console.log('WhatsApp status polling started (every 30 seconds)');
  }

  // Start polling for QR popup (can be called multiple times safely)
  startStatusPolling(): void {
    // If already polling, don't start again
    if (this.isPolling) return;
    
    this.startBackgroundPolling();
  }

  stopStatusPolling(): void {
    this.isPolling = false;
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
    console.log('WhatsApp status polling stopped');
  }

  private checkStatus(): Observable<WhatsAppStatus> {
    return this.qrCodeService.checkStatus().pipe(
      map(response => ({
        sessionId: response.sessionId,
        isReady: response.isReady,
        lastChecked: new Date()
      })),
      tap(status => {
        const currentStatus = this.statusSubject.value;
        // Only update if status actually changed or if it's the first check
        if (!currentStatus || currentStatus.isReady !== status.isReady) {
          this.statusSubject.next(status);
          console.log('WhatsApp status updated:', status);
        } else {
          // Update only the lastChecked time without triggering UI updates
          const updatedStatus = { ...currentStatus, lastChecked: status.lastChecked };
          this.statusSubject.next(updatedStatus);
        }
      }),
      catchError(error => {
        console.error('Error checking WhatsApp status:', error);
        // Keep the last known status on error
        return of();
      })
    );
  }

  // Manual status check (for immediate updates)
  refreshStatus(): Observable<WhatsAppStatus> {
    return this.checkStatus();
  }

  // Method to get polling status
  isPollingActive(): boolean {
    return this.isPolling;
  }

  // Method to get polling interval
  getPollingInterval(): number {
    return this.pollingInterval;
  }
} 