import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './auth.guard';
import { WhatsappGroupCreateComponent } from './whatsapp/whatsapp-group-create/whatsapp-group-create.component';
import { WhatsappGroupListComponent } from './whatsapp/whatsapp-group-list/whatsapp-group-list.component';
import { WhatsappAddMemberComponent } from './whatsapp/whatsapp-add-member/whatsapp-add-member.component';
import { WhatsappSearchMemberComponent } from './whatsapp/whatsapp-search-member/whatsapp-search-member.component';
import { MessageLogsComponent } from './logs/message-logs/message-logs.component';
import { AdminLogoutComponent } from './admin-logout/admin-logout.component';
import { MemberManagementComponent } from './whatsapp/member-management/member-management.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'whatsapp/create-group', component: WhatsappGroupCreateComponent, canActivate: [authGuard] },
  { path: 'whatsapp/list-groups', component: WhatsappGroupListComponent, canActivate: [authGuard] },
  { path: 'whatsapp/add-member', component: WhatsappAddMemberComponent, canActivate: [authGuard] },
  { path: 'whatsapp/search-member', component: WhatsappSearchMemberComponent, canActivate: [authGuard] },
  { path: 'whatsapp/member-management', component:MemberManagementComponent , canActivate: [authGuard] },
  { path: 'logs', component: MessageLogsComponent, canActivate: [authGuard] },
   { path: 'admin-logout', component: AdminLogoutComponent, canActivate: [authGuard] },
  // Other routes will be added here later
]; 