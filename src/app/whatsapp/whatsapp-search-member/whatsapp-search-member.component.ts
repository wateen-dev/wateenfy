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

  constructor(private whatsappService: WhatsappService) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.isLoading = true;
    this.errorMessage = '';

    this.whatsappService.getAllMembers().subscribe({
      next: (response) => {
        this.allMembers = response.data;
        this.displayedMembers = this.allMembers; // Show all members by default
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load members. Please try again.';
      }
    });
  }

  onSearchTermChange() {
    if (this.searchTerm.length > 1) {
      // Filter members based on search term
      this.searchResults = this.allMembers.filter(member =>
        member.member_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        member.member_number.includes(this.searchTerm)
      );
      this.displayedMembers = this.searchResults; // Show filtered results
    } else {
      this.searchResults = [];
      this.displayedMembers = this.allMembers; // Show all members when search is cleared
    }
    this.selectedMember = null; // Clear selected member when search term changes
  }

  selectMember(member: Member) {
    this.selectedMember = member;
    this.searchResults = []; // Hide search results after selection
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
    this.displayedMembers = this.allMembers; // Show all members when search is cleared
    this.selectedMember = null;
  }

  getMemberCardClass(member: Member): string {
    return this.selectedMember?.member_id === member.member_id ? 'member-card selected' : 'member-card';
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
