import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationChartComponent } from './registration-chart/registration-chart.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RegistrationChartComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent {}
