import { Component, HostListener, OnInit } from '@angular/core';
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
  member_count: string | null;
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
  isDeleteMemberLoading: boolean = false;
  errorMessage: string = '';
  selectedGroupId: number | null = null;
  showGroupPopup = false;
  memberPageSize = 2;
  memberCurrentPage = 1;
  paginatedMembers: any[] = []; // Current page
  memberSearchTerm: string = '';
  pageSize = 4; // You can change to 10, 20, etc.
  currentPage = 1;
  paginatedGroups: any[] = []; // Displayed on current page
  activeActionMemberId: number | null = null;
  successMessage: string = '';
  constructor(
    private whatsappService: WhatsappService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadGroups();

  }
  openGroupPopup(groupId: number): void {
    this.selectedGroupId = +groupId;
    this.showGroupPopup = true;
    this.memberCurrentPage = 1;
    this.whatsappService.getAllMembersByGroupID(groupId).subscribe({
      next: (response) => {
        this.members = response.data;
        this.filteredMembers = response.data;
        this.updatePaginatedMembers();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load members. Please contact system administrator.';
      }
    });
  }
  toggleActionMenu(memberId: number) {
    this.activeActionMemberId = this.activeActionMemberId === memberId ? null : memberId;
  }

  deleteMember(memberId: number) {
    this.isDeleteMemberLoading = true;
    console.log('Deleting member:', memberId);
    this.whatsappService.deleteMember(+memberId).subscribe({
      next: (response) => {
        this.successMessage = 'Member ID: ' + memberId + ' has been deleted successfully';

        // Navigate to search member screen after 2 seconds
        setTimeout(() => {
          this.isDeleteMemberLoading = false;
          this.closePopup();
          this.loadGroups();
        }, 2000);
      },
      error: (error) => {
        this.isDeleteMemberLoading = false;
        this.errorMessage = error.error?.message || 'Failed to delete member! Please contact System Administrator';
      }
    });
    // Optionally close the menu
    this.activeActionMemberId = null;

    // Call API and refresh list here
  }
  closePopup(): void {
    this.showGroupPopup = false;
    this.selectedGroupId = null;
  }
  updatePaginatedGroups() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedGroups = this.filteredGroups.slice(start, end);
  }

  // Optional: For previous/next page buttons
  changePage(page: number) {
    this.currentPage = page;
    this.updatePaginatedGroups();
  }

  // Optional: To get total number of pages
  get totalPages(): number {
    return Math.ceil(this.filteredGroups.length / this.pageSize);
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
        this.updatePaginatedGroups();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load groups. Please try again.';
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredGroups = this.groups;
    } else {
      this.filteredGroups = this.groups.filter(group =>
        group.group_name.toLowerCase().includes(term) ||
        group.description?.toLowerCase().includes(term)
      );
    }

    this.currentPage = 1; // Reset to first page after search
    this.updatePaginatedGroups(); // Refresh paginated view
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
  updatePaginatedMembers() {
    const start = (this.memberCurrentPage - 1) * this.memberPageSize;
    const end = start + this.memberPageSize;
    this.paginatedMembers = this.filteredMembers.slice(start, end);
  }

  changeMemberPage(page: number) {
    this.memberCurrentPage = page;
    this.updatePaginatedMembers();
  }

  get memberTotalPages(): number {
    return Math.ceil(this.filteredMembers.length / this.memberPageSize);
  }

  onMemberSearch() {
    const term = this.memberSearchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredMembers = [...this.members];
    } else {
      this.filteredMembers = this.members.filter(member =>
        member.member_name?.toLowerCase().includes(term) ||
        member.member_number?.toLowerCase().includes(term) ||
        member.group_name?.toLowerCase().includes(term) ||
        member.created_by?.toLowerCase().includes(term)
      );
    }

    this.memberCurrentPage = 1;
    this.updatePaginatedMembers();
  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.actions-button') && !target.closest('.action-menu')) {
      this.activeActionMemberId = null;
    }
  }

}

