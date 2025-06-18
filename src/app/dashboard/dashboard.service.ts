import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from '../auth.service';

export interface DashboardStats {
  registeredGroups: number;
  sentMessages: number;
  pendingMessages: number;
  totalMembers: number;
}

interface OverviewResponse {
  get_overview: {
    messages: {
      status: string;
      count: string;
    }[];
    total_groups: {
      count: string;
    };
    total_members: {
      count: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://172.26.52.46/watify/api';

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

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<OverviewResponse>(`${this.baseUrl}/home/overview`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        const overview = response.get_overview;
        
        // Extract message counts
        const sentMessages = overview.messages.find(msg => msg.status.toUpperCase() === 'SENT')?.count || '0';
        const pendingMessages = overview.messages.find(msg => msg.status.toUpperCase() === 'PENDING')?.count || '0';
        
        // Map to DashboardStats interface
        const stats: DashboardStats = {
          registeredGroups: parseInt(overview.total_groups.count) || 0,
          sentMessages: parseInt(sentMessages) || 0,
          pendingMessages: parseInt(pendingMessages) || 0,
          totalMembers: parseInt(overview.total_members.count) || 0
        };
        
        return stats;
      })
    );
  }
} 