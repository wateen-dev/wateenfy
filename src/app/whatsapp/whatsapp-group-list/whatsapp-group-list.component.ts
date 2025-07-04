import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { WhatsappService } from '../whatsapp.service';

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
  member_count:string | null;
}
interface Member {
  member_id: string;
  member_name: string;
  member_number: string;
  session_id: string;
  group_name: string | null;
  created_by: string | null;
  created_at: string;
  modified_at: string;
  modified_by: string | null;
  is_deleted: string;
}

@Component({
  selector: 'app-whatsapp-group-list',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './whatsapp-group-list.component.html',
  styleUrl: './whatsapp-group-list.component.scss'
})
export class WhatsappGroupListComponent implements OnInit {
  groups: Group[] = [];
  filteredGroups: Group[] = [];
  members: Member[] = [];
  filteredMembers: Member[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedGroupId: number | null = null;
  showGroupPopup = false;

  constructor(
    private whatsappService: WhatsappService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGroups();
  }
  openGroupPopup(groupId: number): void {
    this.selectedGroupId = +groupId;
    this.showGroupPopup = true;

    this.whatsappService.getAllMembersByGroupID(groupId).subscribe({
      next: (response) => {
        this.members = response.data;
        this.filteredMembers = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load members. Please contact system administrator.';
      }
    });
  }
  closePopup(): void {
    this.showGroupPopup = false;
    this.selectedGroupId = null;
  }
  loadGroups() {
    this.isLoading = true;
    this.errorMessage = '';

    this.whatsappService.getGroups().subscribe({
      next: (response) => {
        this.groups = response.data;
        console.log(this.groups);
        this.filteredGroups = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load groups. Please try again.';
      }
    });
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredGroups = this.groups;
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredGroups = this.groups.filter(group => 
      group.group_name.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower)
    );
  }

  onCreateGroup() {
    this.router.navigate(['/whatsapp/create-group']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
