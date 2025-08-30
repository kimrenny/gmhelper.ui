import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAllLogsComponent } from './all-logs/all-logs.component';
import { AdminAuthLogsComponent } from './auth-logs/auth-logs.component';
import { AdminErrorLogsComponent } from './error-logs/error-logs.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [
    CommonModule,
    AdminAllLogsComponent,
    AdminAuthLogsComponent,
    AdminErrorLogsComponent,
    TranslateModule,
  ],
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.scss'],
})
export class AdminLogsComponent {
  activeLog: 'all' | 'auth' | 'error' | 'none' = 'all';

  setActiveLog(logType: 'all' | 'auth' | 'error') {
    this.activeLog = logType;
  }
}
