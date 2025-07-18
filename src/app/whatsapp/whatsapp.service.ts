import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth.service';
import { WhatsAppStatusService } from '../services/whatsapp-status.service';
import { switchMap } from 'rxjs/operators';

interface CreateGroupWithMembersRequest {
  group_name: string;
  description: string;
  created_by: string;
  modified_by: string;
  members: {
    member_name: string;
    phone_number: string;
  }[];
}
interface DeleteMemberRequest {
 member_id:number;
}

interface Group {
  group_id: string;
  group_name: string;
  created_at: string;
  created_by: string | null;
  modified_at: string;
  modified_by: string | null;
  is_deleted: string;
  description: string | null;
  session_id: string;
  member_count:string;
}

interface GroupsResponse {
  message: string;
  data: Group[];
}
interface MessageResponse {
  message: string;
  data: Member[];
}

interface Member {
  member_id: string;
  group_id: string;
  member_name: string;
  member_number: string;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  is_deleted: string;
  group_name: string;
  session_id: string;
  status:string;
}

interface ApiResponse<T> {
  message: string;
  data: T[];
}

interface AddMembersToGroupRequest {
  group_name: string;
  session_id: string;
  members: {
    member_name: string;
    phone_number: string;
  }[];
}

interface AddMemberRequest {
  sessionId: string;
  group_name: string;
  members: {
    member_name: string;
    phone_number: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  // private readonly API_URL = 'http://172.26.52.46/watify/api';
private readonly API_URL = 'https://watify.wateen.com/watify/api';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private statusService: WhatsAppStatusService
  ) {}

  private checkWhatsAppReady(): Observable<boolean> {
    if (!this.statusService.isReady()) {
      return throwError(() => new Error('WhatsApp session is not ready. Please scan the QR code first.'));
    }
    return new Observable(subscriber => {
      subscriber.next(true);
      subscriber.complete();
    });
  }

  createGroupWithMembers(groupName: string, description: string, members: { member_name: string; phone_number: string }[]): Observable<any> {
    return this.checkWhatsAppReady().pipe(
      switchMap(() => {
        const user = this.auth.getUser();
        if (!user) {
          throw new Error('User not logged in');
        }
        const firstName = user.name.split(' ')[0]; // Get first name
       const phoneNumber = user.email.split('@')[0];
        const request: CreateGroupWithMembersRequest = {
          group_name: groupName,
          description: description,
          created_by: firstName,
          modified_by: firstName,
          members: members.map(member => ({
            member_name: member.member_name,
            phone_number: member.phone_number
          }))
        };

        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.auth.getToken()}`
        });

        return this.http.post(`${this.API_URL}/whatsapp/add`, request, { headers });
      })
    );
  }

    deleteMember(memberID: number): Observable<any> {
    return this.checkWhatsAppReady().pipe(
      switchMap(() => {
        const request: DeleteMemberRequest = {
          member_id: memberID,
        }; 
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.auth.getToken()}`
        });

        return this.http.put(`${this.API_URL}/member/delete`, request, { headers });
      })
    );
  }

  getGroups(): Observable<GroupsResponse> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    return this.http.get<GroupsResponse>(`${this.API_URL}/group/all`, { headers });
  }
   getAllMembersByGroupID(group_id: number): Observable<MessageResponse> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    return this.http.post<MessageResponse>(`${this.API_URL}/member/specificgroup`,{group_id}, { headers });
  }

  getAllMembers() {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    return this.http.get<ApiResponse<Member>>(`${this.API_URL}/member/all`, { headers });
  }

  // Method to check if WhatsApp is ready (for UI components)
  isWhatsAppReady(): boolean {
    return this.statusService.isReady();
  }

  // Method to get current status (for UI components)
  getWhatsAppStatus() {
    return this.statusService.getCurrentStatus();
  }

  addMembersToGroup(groupName: string, members: { member_name: string; phone_number: string }[]): Observable<any> {
    return this.checkWhatsAppReady().pipe(
      switchMap(() => {
        const user = this.auth.getUser();
        if (!user) {
          throw new Error('User not logged in');
        }

        const phoneNumber = user.phone_number;

        const request: AddMembersToGroupRequest = {
          group_name: groupName,
          session_id: phoneNumber,
          members: members.map(member => ({
            member_name: member.member_name,
            phone_number: member.phone_number
          }))
        };

        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.auth.getToken()}`
        });

        return this.http.post(`${this.API_URL}/whatsapp/add-members`, request, { headers });
      })
    );
  }
// logout(){
//    const headers = new HttpHeaders({
//     'Authorization': `Bearer ${this.auth.getToken()}`,
//     'Accept': 'application/json',
//     'Content-Type': 'application/json'
//   });

//   this.http.post(`${this.API_URL}/auth/logout`, {}, { headers }).subscribe({
//     next: () => {
//       console.log('Logged out from server.');
//     },
//     error: (err) => {
//       console.error('Logout API failed', err);
//     }
//   });
// }
  addGroupMembers(groupName: string, members: { member_name: string; phone_number: string }[]): Observable<any> {
    return this.checkWhatsAppReady().pipe(
      switchMap(() => {
        const user = this.auth.getUser();
        if (!user) {
          throw new Error('User not logged in');
        }

        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.auth.getToken()}`
        });

        const request: AddMemberRequest = {
          sessionId: user.phone_number,
          group_name: groupName,
          members: members.map(member => ({
            member_name: member.member_name,
            phone_number: member.phone_number
          }))
        };

        return this.http.post(`${this.API_URL}/whatsapp/add-group-members`, request, { headers });
      })
    );
  }
} 