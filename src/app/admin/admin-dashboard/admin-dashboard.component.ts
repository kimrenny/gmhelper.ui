import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationChartComponent } from './registration-chart/registration-chart.component';
import { ActiveUsersComponent } from './active-users/active-users.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RegistrationChartComponent, ActiveUsersComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent {}
