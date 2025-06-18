import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { WhatsappService } from '../whatsapp.service';

interface Member {
  member_name: string;
  phone_number: string;
}

interface Group {
  group_id: string;
  group_name: string;
}

@Component({
  selector: 'app-whatsapp-add-member',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './whatsapp-add-member.component.html',
  styleUrls: ['./whatsapp-add-member.component.scss']
})
export class WhatsappAddMemberComponent implements OnInit {
  members: Member[] = [{ member_name: '', phone_number: '' }];
  groups: Group[] = [];
  selectedGroupName: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private whatsappService: WhatsappService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.isLoading = true;
    this.errorMessage = '';

    this.whatsappService.getGroups().subscribe({
      next: (response) => {
        this.groups = response.data.map(group => ({
          group_id: group.group_id,
          group_name: group.group_name
        }));
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load groups. Please try again.';
      }
    });
  }

  addMember() {
    this.members.push({ member_name: '', phone_number: '' });
  }

  removeMember(index: number) {
    if (this.members.length > 1) {
      this.members.splice(index, 1);
    }
  }

  validateMembers(): boolean {
    // Check if a group is selected
    if (!this.selectedGroupName) {
      this.errorMessage = 'Please select a group';
      return false;
    }

    // Check if all members have both name and number
    const invalidMembers = this.members.some(member => !member.member_name.trim() || !member.phone_number.trim());
    if (invalidMembers) {
      this.errorMessage = 'Please fill in all member details';
      return false;
    }

    // Validate phone numbers (basic validation)
    const invalidNumbers = this.members.some(member => !/^\d{10,15}$/.test(member.phone_number.replace(/\D/g, '')));
    if (invalidNumbers) {
      this.errorMessage = 'Please enter valid phone numbers';
      return false;
    }

    return true;
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateMembers()) {
      return;
    }

    this.isLoading = true;

    this.whatsappService.addGroupMembers(this.selectedGroupName, this.members).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'Members added successfully! Redirecting to search member screen...';
        // Reset form after successful submission
        this.members = [{ member_name: '', phone_number: '' }];
        this.selectedGroupName = '';
        // Navigate to search member screen after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/whatsapp/search-member']);
        }, 2000);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to add members. Please try again.';
      }
    });
  }
}
