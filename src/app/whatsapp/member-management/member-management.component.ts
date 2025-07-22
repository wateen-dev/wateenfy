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
  selector: 'app-member-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, MatFormFieldModule, MatSelectModule, MatInputModule],
  templateUrl: './member-management.component.html',
  styleUrl: './member-management.component.css'
})

export class MemberManagementComponent implements OnInit {
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
    this.loadMembers();
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
  loadMembers() {
    this.isLoading = true;
    this.errorMessage = '';

    this.whatsappService.getMembers().subscribe({
      next: (response) => {
        debugger
        this.members = response.data.map(member => ({
          member_id: member.member_id,
          member_name: member.member_name
        }));
        this.filteredMembers = [...this.members];


        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load groups. Please try again.';
      }
    });
  }
  onMemberSelect(event: MatSelectChange): void {
    // event.value is the full object
    debugger
    const picked = event.value as { member_id: number; member_name: string };
    this.selectedMember = picked;
    this.selectedMemberId = picked.member_id;
    this.LoadSelectedGroupsIfAny(this.selectedMemberId)
    this.selectedMemberId = picked.member_id;
    // this.selectedGroups = [
    //   { group_id: '82', group_name: 'NOC-EBU-OFC/SDS-Lahore_2' },
    //   { group_id: '83', group_name: 'NOC-OFC-Central-1_2' }
    // ];
    console.log('Picked member_id →', this.selectedMemberId);
    // you can still access name with picked.member_name when needed
  }
LoadSelectedGroupsIfAny(memberId: any): void {
  if (!memberId) { this.selectedGroups = []; return; }

  this.isLoading = true;
  this.errorMessage = '';
 this.selectedGroups = [];
  this.whatsappService.getSelectedGroups(memberId).subscribe({
    next: res => {
      /* API →  { data: [ {group_id, group_name, …}, … ] } */
      this.selectedGroups = res.data.map(g => ({
        group_id:  g.group_id,
        group_name: g.group_name
      })) as Group[];
      setTimeout(() => {
        this.dropdownOpen = true; // your boolean for dropdown visibility
      }, 300); // allow UI to render first
      this.isLoading = false;
    },
    error: err => {
      console.error('LoadSelectedGroupsIfAny error', err);
      this.errorMessage = 'Could not load member groups.';
      this.isLoading = false;
    }
  });
}
  filterMembers() {
    const term = this.memberSearch?.toLowerCase() ?? '';
    this.filteredMembers = this.members.filter(member =>
      member.member_name.toLowerCase().includes(term)
    );
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

  validateMembers(): boolean {
    // Check if a group is selected
    if (this.selectedGroups.length === 0) {
      this.errorMessage = 'Please select at least one group.';
      return false;
    }
    if (this.selectedMember == null) {
      this.errorMessage = 'Please select member first';
      return false;
    }
    return true;
  }
    validateMembersonDeleteAllGroups(): boolean {
    // Check if a group is selected
    // if (this.selectedGroups.length === 0) {
    //   this.errorMessage = 'Please select at least one group.';
    //   return false;
    // }
    if (this.selectedMember == null) {
      this.errorMessage = 'Please select member first';
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
    if (!this.validateMembers()) {
      return;
    }
    if (!this.selectedMember?.member_id) {
      // show error or return early
      this.errorMessage = 'Please select a member.';
      return;
    }

    const finalMapping = {
      member_id: String(this.selectedMember.member_id),
      groups: this.selectedGroups
    };
    this.isAdding = true;

    this.whatsappService.addGroupMemberQueue(finalMapping).subscribe({
      next: (response: any) => {
        this.isAdding = false;
        const memberId = response?.data?.member_id;
        const successMsg = `Members added successfully. Member ID: ${memberId}`;
        this.successMessage = successMsg;
        this.selectedGroups = [];
        this.selectedGroupName = '';
        // Trigger change detection immediately to update the DOM before redirection
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/whatsapp/search-member']);
        }, 3000);
      },
      error: (error: any) => {
        this.isAdding = false;
        this.errorMessage = error.error?.message || 'Failed to add members. Please try again.';
      }
    });
  }
  removeMember() {
    debugger
    this.isRemoving = true;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.validateMembers()) {
      return;
    }

    if (!this.selectedMember?.member_id) {
      // show error or return early
      this.errorMessage = 'Please select a member.';
      return;
    }

    const finalMapping = {
      member_id: String(this.selectedMember?.member_id),
      groups: this.selectedGroups,
      type:"group"
    };

    this.whatsappService.removeGroupMemberQueue(finalMapping).subscribe({
      next: (response: any) => {
        this.isRemoving = false;
         const memberId = response?.data?.member_id;
        const successMsg = `Member removed successfully. Member ID: ${memberId}`;
        this.successMessage = successMsg;
        this.selectedGroups = [];
        this.selectedGroupName = '';
        // Trigger change detection immediately to update the DOM before redirection
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/whatsapp/search-member']);
        }, 3000);
      },
      error: () => {
        this.isRemoving = false;
        this.errorMessage = 'Failed to remove member.';
      }
    });
  }
    removeMemberfromAllGroups() {
    debugger
    this.isRemovingAll = true;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.validateMembersonDeleteAllGroups()) {
      return;
    }
    const finalMapping = {
      member_id: String(this.selectedMember?.member_id),
      type:"all"
    };

    this.whatsappService.removeAllGroupMemberQueue(finalMapping).subscribe({
      next: (response: any) => {
        this.isRemovingAll = false;
         const memberId = response?.data?.member_id;
        const successMsg = `Member removed from all groups successfully. Member ID: ${memberId}`;
        this.successMessage = successMsg;
        this.selectedGroups = [];
        this.selectedGroupName = '';
        // Trigger change detection immediately to update the DOM before redirection
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/whatsapp/search-member']);
        }, 3000);
      },
      error: () => {
        this.isRemovingAll = false;
        this.errorMessage = 'Failed to remove member.';
      }
    });
  }
}
