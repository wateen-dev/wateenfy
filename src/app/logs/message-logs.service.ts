import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

export interface MessageLog {
  message_id: string;
  group_id: string;
  message: string;
  status: string;
  type: string;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  is_deleted: string;
  group_name: string;
  session_id: string;
}

export interface MessageLogsResponse {
  message: string;
  data: MessageLog[];
}

@Injectable({
  providedIn: 'root'
})
export class MessageLogsService {
  private baseUrl = 'https://watify.wateen.com/watify/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllMessages(): Observable<MessageLogsResponse> {
    return this.http.get<MessageLogsResponse>(`${this.baseUrl}/message/all`, {
      headers: this.getHeaders()
    });
  }
} 