import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { WhatsappService } from '../whatsapp.service';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange } from '@angular/material/select';
import { ChangeDetectorRef } from '@angular/core'; // make sure this is imported

interface Member {
  member_name: string;
  member_id: string;
}

interface Group {
  group_id: string;
  group_name: string;
}
@Component({
  selector: 'app-send-message',
  standalone: true,
    imports: [CommonModule, FormsModule, SidebarComponent, MatFormFieldModule, MatSelectModule, MatInputModule],
  
  templateUrl: './send-message.component.html',
  styleUrl: './send-message.component.css'
})

export class SendMessageComponent implements OnInit{
   message: string = '';
  members: Member[] = [{ member_name: '', member_id: '' }];
  groups: Group[] = [];
  selectedGroupName: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  selectedGroups: Group[] = [];
  @ViewChild('dropdown') dropdownRef!: ElementRef;
  dropdownOpen: boolean = false;
  selectedMember: { member_id: number; member_name: string } | null = null;
  selectedMemberId?: number;   // just the ID you want to show/use elsewhere
  filteredMembers: Member[] = [];  // list after applying search
  memberSearch: string = '';
  ExistedselectedGroups: Group[] = [];
  isAdding: boolean = false;
  isRemoving: boolean = false;
  isRemovingAll: boolean = false;
  constructor(
    private whatsappService: WhatsappService,
    private router: Router,
    private cdr: ChangeDetectorRef // inject it
  ) { }

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

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    setTimeout(() => {
      this.dropdownOpen = false;
    }, 200);
  }

  isSelected(group: Group): boolean {

    return this.selectedGroups.some(g => g.group_id === group.group_id);
  }

  onGroupToggle(group: Group) {
    const index = this.selectedGroups.findIndex(g => g.group_id === group.group_id);
    if (index > -1) {
      this.selectedGroups.splice(index, 1);
    } else {
      this.selectedGroups.push(group);
    }
  }
  get selectedGroupNames(): string {
    if (this.selectedGroups.length === 0) {
      return 'Select groups';
    }
    return this.selectedGroups.map(g => g.group_name).join(', ');
  }

  validateMessage(): boolean {
    // Check if a group is selected
    if (this.selectedGroups.length === 0) {
      this.errorMessage = 'Please select at least one group.';
      return false;
    }
    if (this.message.length === 0) {
      this.errorMessage = 'Message Field should not be empty.';
      return false;
    }

    return true;
  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (
      this.dropdownRef &&
      !this.dropdownRef.nativeElement.contains(event.target)
    ) {
      this.dropdownOpen = false;
    }
  }
  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.validateMessage()) {
      return;
    }
    const finalPayload = {
      number: this.selectedGroups.map(group => String(group.group_id)), // or simply String(group) if it's a direct array of IDs
      message: this.message, // assuming this.message is already bound to the textarea using [(ngModel)]
      isGroup: true,
      type: 'groups'
    };
    this.isAdding = true;

    this.whatsappService.sendMessageToGroups(finalPayload).subscribe({
      next: (response: any) => {
        this.isAdding = false;
        const successMsg = `Message Sent Successfully`;
        this.successMessage = successMsg;
        this.selectedGroups = [];
        this.selectedGroupName = '';
        // Trigger change detection immediately to update the DOM before redirection
        this.cdr.detectChanges();
        // setTimeout(() => {
        //   this.router.navigate(['/whatsapp/search-member']);
        // }, 3000);
      },
      error: (error: any) => {
        this.isAdding = false;
        this.errorMessage = error.error?.message || 'Failed to send message. Please try again.';
      }
    });
  }
}
