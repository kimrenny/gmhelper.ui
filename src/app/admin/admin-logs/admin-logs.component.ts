import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAllLogsComponent } from './all-logs/all-logs.component';
import { AdminAuthLogsComponent } from './auth-logs/auth-logs.component';
import { AdminErrorLogsComponent } from './error-logs/error-logs.component';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [
    CommonModule,
    AdminAllLogsComponent,
    AdminAuthLogsComponent,
    AdminErrorLogsComponent,
  ],
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.scss'],
})
export class AdminLogsComponent {}
