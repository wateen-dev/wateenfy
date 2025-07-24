import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from '../auth.service';

// export interface DashboardStats {
//   registeredGroups: number;
//   sentMessages: number;
//   pendingMessages: number;
//   totalMembers: number;
// }

// interface OverviewResponse {
//   get_overview: {
//     messages: {
//       status: string;
//       count: string;
//     }[];
//     total_groups: {
//       count: string;
//     };
//     total_members: {
//       count: string;
//     };
//   };
// }
interface MessageStatResponse {
  message: string;
  data: {
    status: string;
    count: string;
    [key: string]: any;
  }[];
}
export interface MessageStatus {
  status: string;
  count: string;
}

export interface StatusCounts {
  active: number;
  inactive: number;
  invited: number,
  pending: number
}

export interface OverviewResponse {
  get_overview: {
    messages: MessageStatus[];
    total_groups: { count: string };
    total_members: { count: string };
    status_counts: StatusCounts;
  };
}
export interface DashboardStats {
  registeredGroups: number;
  sentMessages: number;
  pendingMessages: number;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  invited: number,
  pending: number
}
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
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

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<OverviewResponse>(`${this.baseUrl}/home/overview`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
      const overview = response.get_overview;

      const sentMessages = overview.messages.find(
        msg => msg.status.toUpperCase() === 'SENT'
      )?.count || '0';

      const pendingMessages = overview.messages.find(
        msg => msg.status.toUpperCase() === 'PENDING'
      )?.count || '0';

      const stats: DashboardStats = {
        registeredGroups: parseInt(overview.total_groups.count, 10) || 0,
        sentMessages: parseInt(sentMessages, 10) || 0,
        pendingMessages: parseInt(pendingMessages, 10) || 0,
        totalMembers: parseInt(overview.total_members.count, 10) || 0,
        activeMembers: overview.status_counts?.active || 0,
        inactiveMembers: overview.status_counts?.inactive || 0,
        invited: overview.status_counts?.invited || 0,
        pending: overview.status_counts?.pending || 0
      };

      // this.dashboardStats = stats;
        
        return stats;
      })
    );
  }
getMessageStats(
  status: 'sent' | 'pending',
  start_date: string,
  end_date: string
): Observable<MessageStatResponse> {
const token = this.authService.getToken();
  if (!token) {
    throw new Error('User not logged in');
  }

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`
  });

  const body = {
    status,
    start_date,
    end_date
  };

  return this.http.post<MessageStatResponse>(
    `${this.baseUrl}/message/filter`,
    body,
    { headers }
  );
}


} 