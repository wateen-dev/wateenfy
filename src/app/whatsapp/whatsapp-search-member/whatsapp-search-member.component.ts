import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { WhatsappService } from '../whatsapp.service';

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

@Component({
  selector: 'app-whatsapp-search-member',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './whatsapp-search-member.component.html',
  styleUrls: ['./whatsapp-search-member.component.scss']
})
export class WhatsappSearchMemberComponent implements OnInit {
  searchTerm: string = '';
  searchResults: Member[] = [];
  selectedMember: Member | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  allMembers: Member[] = [];
  displayedMembers: Member[] = [];

  members: Member[] = [];         // full list from API
  filteredMembers: Member[] = []; // after search
  paginatedMembers: Member[] = []; // current page slice

  pageSize = 5;
  currentPage = 1;
  totalPages = 1;

  constructor(private whatsappService: WhatsappService) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  /** 1. GET DATA */
  loadMembers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.whatsappService.getAllMembers().subscribe({
      next: (res) => {
        debugger
        this.members = res.data;
        this.onSearch();          // ➜ initialise filter & pagination
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'Failed to load members. Please try again.';
        this.isLoading = false;
      },
    });
  }

  /** 2. FILTER (called on every keystroke) */
  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredMembers = term
      ? this.members.filter(
          (m) =>
            m.member_name.toLowerCase().includes(term) ||
            m.member_number.includes(term) ||
            m.group_name.toLowerCase().includes(term)
        )
      : [...this.members];

    this.currentPage = 1;
    this.refreshPagination();
  }
activeActionMemberId: string | null = null;

toggleActionMenu(memberId: string): void {
  this.activeActionMemberId =
    this.activeActionMemberId === memberId ? null : memberId;
}

// Placeholder for actual delete logic
deleteMember(memberId: string): void {
  console.log('Deleting member:', memberId);
}

deleteMemberFromAllGroups(member: any): void {
  console.log('Deleting member from all groups:', member);
}
  /** 3. PAGINATE */
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.refreshPagination();
  }

  private refreshPagination(): void {
    this.totalPages =
      Math.ceil(this.filteredMembers.length / this.pageSize) || 1;

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedMembers = this.filteredMembers.slice(start, end);
  }

/** util */
formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}

/** placeholder for ⋮ button */
openActionMenu(m: any): void {
  console.log('Action for', m);
}
}

