import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { WhatsappService } from '../whatsapp.service';

interface Member {
  member_name: string;
  phone_number: string;
}

@Component({
  selector: 'app-whatsapp-group-create',
  standalone: true,
  imports: [FormsModule, CommonModule, SidebarComponent],
  templateUrl: './whatsapp-group-create.component.html',
  styleUrls: ['./whatsapp-group-create.component.scss']
})
export class WhatsappGroupCreateComponent {
  memberMode: 'excel' | 'manual' = 'excel';
  groupName: string = '';
  description: string = '';
  members: Member[] = [{ member_name: '', phone_number: '' }];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private whatsappService: WhatsappService,
    private router: Router
  ) {}

  addMember() {
    this.members.push({ member_name: '', phone_number: '' });
  }

  removeMember(index: number) {
    if (this.members.length > 1) {
      this.members.splice(index, 1);
    }
  }

  validateForm(): boolean {
    // Check if group name is provided
    if (!this.groupName.trim()) {
      this.errorMessage = 'Please enter a group name';
      return false;
    }

    // Check if at least one member is provided
    if (this.members.length === 0) {
      this.errorMessage = 'Please add at least one member to the group';
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

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    // Create group with members in a single API call
    this.whatsappService.createGroupWithMembers(this.groupName, this.description, this.members).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Group created and members added successfully! Redirecting to search member screen...';
        // Reset form
        this.groupName = '';
        this.description = '';
        this.members = [{ member_name: '', phone_number: '' }];
        // Navigate to search member screen after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/whatsapp/search-member']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create group with members. Please try again.';
      }
    });
  }
}
