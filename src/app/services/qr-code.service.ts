import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

interface QRCodeResponse {
  qrCode: string;
}

interface StatusResponse {
  sessionId: string;
  isReady: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class QRCodeService {
  private readonly API_URL = 'https://watify.wateen.com/watify/api';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getQRCode(): Observable<QRCodeResponse> {
    const user = this.auth.getUser();
    if (!user) {
      throw new Error('User not logged in');
    }

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    return this.http.get<QRCodeResponse>(
      `${this.API_URL}/whatsapp/qr`,
      { headers }
    );
  }

  checkStatus(): Observable<StatusResponse> {
    const user = this.auth.getUser();
    if (!user) {
      throw new Error('User not logged in');
    }

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.auth.getToken()}`
    });
    return this.http.get<StatusResponse>(
      `${this.API_URL}/whatsapp/status`,
      { headers }
    );
  }
} 