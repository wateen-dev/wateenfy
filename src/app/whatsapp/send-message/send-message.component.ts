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

@Component({
  selector: 'app-send-message',
  standalone: true,
    imports: [CommonModule, FormsModule, SidebarComponent, MatFormFieldModule, MatSelectModule, MatInputModule],
  
  templateUrl: './send-message.component.html',
  styleUrl: './send-message.component.css'
})
export class SendMessageComponent {

}
