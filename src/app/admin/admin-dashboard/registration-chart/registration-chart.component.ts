import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { AdminService } from 'src/app/services/admin.service';
import { TokenService } from 'src/app/services/token.service';
import { Subscription } from 'rxjs';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineController,
} from 'chart.js';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RegistrationData {
  date: string;
  registrations: number;
}

@Component({
  selector: 'app-registration-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, TranslateModule],
  templateUrl: './registration-chart.component.html',
  styleUrls: ['./registration-chart.component.scss'],
})
export class RegistrationChartComponent implements OnInit, OnDestroy {
  userRole: string | any;
  selectedPeriod: string = 'week';
  registrationChartData: any = {
    datasets: [
      {
        data: [],
        label: 'Registrations',
        fill: false,
        borderColor: '#4bc0c0',
        tension: 0.1,
        type: 'line',
      },
    ],
  };

  registrationChartOptions: any = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Count of Registrations',
        },
        ticks: {
          beginAtZero: true,
          stepSize: 1,
          precision: 0,
        },
      },
    },
  };

  private subscriptions = new Subscription();

  constructor(
    private adminService: AdminService,
    private tokenService: TokenService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    let translations: { [key: string]: string } = {};

    this.translateService
      .get([
        'ADMIN.DASHBOARD.REGISTRATIONS.CHART.TITLE',
        'ADMIN.DASHBOARD.REGISTRATIONS.CHART.X_AXIS',
        'ADMIN.DASHBOARD.REGISTRATIONS.CHART.Y_AXIS',
        'ADMIN.DASHBOARD.REGISTRATIONS.SELECT_PERIOD',
        'ADMIN.DASHBOARD.REGISTRATIONS.WEEK',
        'ADMIN.DASHBOARD.REGISTRATIONS.MONTH',
        'ADMIN.DASHBOARD.REGISTRATIONS.6_MONTHS',
        'ADMIN.DASHBOARD.REGISTRATIONS.YEAR',
        'ADMIN.DASHBOARD.REGISTRATIONS.5_YEARS',
        'ADMIN.DASHBOARD.REGISTRATIONS.ALL_TIME',
      ])
      .subscribe((data) => {
        translations = data;

        this.registrationChartOptions.scales.x.title.text =
          translations['ADMIN.DASHBOARD.REGISTRATIONS.CHART.X_AXIS'];
        this.registrationChartOptions.scales.y.title.text =
          translations['ADMIN.DASHBOARD.REGISTRATIONS.CHART.Y_AXIS'];
        this.registrationChartData.datasets[0].label =
          translations['ADMIN.DASHBOARD.REGISTRATIONS.CHART.TITLE'];
      });

    const roleSub = this.tokenService.userRole$.subscribe((role) => {
      this.userRole = role;
      if (this.userRole === 'Admin' || this.userRole === 'Owner') {
        this.adminService.checkRegistrationsData();

        this.adminService
          .getRegistrationDataObservable()
          .subscribe((registrations) => {
            if (registrations) {
              console.log('raw data: ', registrations);
              this.updateChartData(registrations);
            }
          });
      }
    });

    this.subscriptions.add(roleSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onPeriodChange(event: Event): void {
    const selectedPeriod = (event.target as HTMLSelectElement).value;
    this.selectedPeriod = selectedPeriod;

    this.adminService
      .getRegistrationDataObservable()
      .subscribe((registrations) => {
        if (registrations) {
          this.filterDataByPeriod(registrations, this.selectedPeriod);
        }
      });
  }

  private filterDataByPeriod(data: RegistrationData[], period: string): void {
    const currentDate = new Date();
    let filteredData = [...data];

    switch (period) {
      case 'week': {
        const weekAgo = new Date(currentDate.getDate() - 7);
        filteredData = data.filter((item) => new Date(item.date) >= weekAgo);
        this.updateChartData(filteredData);
        break;
      }

      case 'month': {
        const monthAgo = new Date();
        monthAgo.setMonth(currentDate.getMonth() - 1);
        filteredData = data.filter((item) => new Date(item.date) >= monthAgo);
        this.updateChartData(filteredData);
        break;
      }

      case '6months': {
        filteredData = this.processMonthlyData(data, 6);
        this.updateChartDataByMonths(filteredData);
        break;
      }

      case 'year': {
        filteredData = this.processMonthlyData(data, 12);
        this.updateChartDataByMonths(filteredData);
        break;
      }

      case '5years': {
        filteredData = this.processYearlyData(data, 5);
        this.updateChartDataByYears(filteredData);
        break;
      }
      case 'all': {
        const firstDate = new Date(data[0]?.date || currentDate);
        const yearsDiff = currentDate.getFullYear() - firstDate.getFullYear();

        if (yearsDiff <= 1) {
          filteredData = this.processMonthlyData(data, 12);
          this.updateChartDataByMonths(filteredData);
        } else {
          filteredData = this.processYearlyData(data, 5);
          this.updateChartDataByYears(filteredData);
        }
        break;
      }
      default:
        filteredData = [...data];
        this.updateChartData(filteredData);
    }
  }

  aggregateByMonth(data: RegistrationData[]): RegistrationData[] {
    const groupedData: { [key: string]: number } = {};

    data.forEach(({ date, registrations }) => {
      const month = date.substring(0, 7);
      groupedData[month] = (groupedData[month] || 0) + registrations;
    });

    return Object.entries(groupedData)
      .map(([date, registrations]) => ({
        date,
        registrations,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  aggregateByYear(data: RegistrationData[]): RegistrationData[] {
    const groupedData: { [key: string]: number } = {};

    data.forEach(({ date, registrations }) => {
      const year = date.substring(0, 4);
      groupedData[year] = (groupedData[year] || 0) + registrations;
    });

    return Object.entries(groupedData)
      .map(([date, registrations]) => ({
        date,
        registrations,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private processMonthlyData(
    filteredData: RegistrationData[],
    months: number
  ): RegistrationData[] {
    if (filteredData.length < 1) return [];
    if (months !== 6 && months !== 12) return [];
    const monthlyData: { [key: string]: number } = {};

    filteredData.forEach(({ date, registrations }) => {
      const monthKey = date.slice(0, 7);
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + registrations;
    });

    let result = Object.entries(monthlyData)
      .map(([date, registrations]) => ({ date, registrations }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const now = new Date();
    const lastPeriod: string[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      lastPeriod.push(
        `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`
      );
    }

    lastPeriod.forEach((month) => {
      if (!result.some((d) => d.date === month)) {
        result.push({ date: month, registrations: 0 });
      }
    });

    result.sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }

  private processYearlyData(
    filteredData: RegistrationData[],
    years: number
  ): RegistrationData[] {
    if (filteredData.length < 1) return [];
    const yearlyData: { [key: string]: number } = {};

    filteredData.forEach(({ date, registrations }) => {
      const monthKey = date.slice(0, 4);
      yearlyData[monthKey] = (yearlyData[monthKey] || 0) + registrations;
    });

    let result = Object.entries(yearlyData)
      .map(([date, registrations]) => ({ date, registrations }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const now = new Date();
    const lastPeriod: string[] = [];
    for (let i = years - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear() - i, 1);
      lastPeriod.push(`${date.getFullYear()}`);
    }

    lastPeriod.forEach((month) => {
      if (!result.some((d) => d.date === month)) {
        result.push({ date: month, registrations: 0 });
      }
    });

    result.sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }

  private updateChartData(filteredData: any[]): void {
    const startDate = new Date(filteredData[0]?.date || new Date());
    const endDate = new Date();

    const allDates: string[] = [];
    const dateCursor = new Date(startDate);

    while (dateCursor <= endDate) {
      allDates.push(dateCursor.toISOString().split('T')[0]);
      dateCursor.setDate(dateCursor.getDate() + 1);
    }

    const completeData = allDates.map((date) => {
      const existing = filteredData.find((d) => d.date === date);
      return existing ? existing : { date, registrations: 0 };
    });

    const chartData = completeData.map((data) => data.registrations);
    const chartLabels = completeData.map((data) => data.date);

    this.registrationChartData = {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          label: this.registrationChartData.datasets[0].label,
          fill: false,
          borderColor: '#4bc0c0',
          tension: 0.1,
          type: 'line',
        },
      ],
    };
  }

  private updateChartDataByMonths(filteredData: any[]): void {
    const startDate = new Date(filteredData[0]?.date + '-01' || new Date());
    const endDate = new Date();
    const allDates: string[] = [];
    const dateCursor = new Date(startDate);

    while (dateCursor <= endDate) {
      const monthKey = `${dateCursor.getFullYear()}-${(
        dateCursor.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}`;
      allDates.push(monthKey);
      dateCursor.setMonth(dateCursor.getMonth() + 1);
    }

    const completeData = allDates.map((date) => {
      const existing = filteredData.find((d) => d.date === date);
      return existing ? existing : { date, registrations: 0 };
    });

    const chartData = completeData.map((data) => data.registrations);
    const chartLabels = completeData.map((data) => data.date);

    this.registrationChartData = {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          label: this.registrationChartData.datasets[0].label,
          fill: false,
          borderColor: '#4bc0c0',
          tension: 0.1,
          type: 'line',
        },
      ],
    };
  }

  private updateChartDataByYears(filteredData: any[]): void {
    const startDate = new Date(filteredData[0]?.date + '-01-01' || new Date());
    const endDate = new Date();
    const allDates: string[] = [];
    const dateCursor = new Date(startDate);

    while (dateCursor <= endDate) {
      const yearKey = `${dateCursor.getFullYear()}`;
      allDates.push(yearKey);
      dateCursor.setFullYear(dateCursor.getFullYear() + 1);
    }

    const completeData = allDates.map((date) => {
      const existing = filteredData.find((d) => d.date === date);
      return existing ? existing : { date, registrations: 0 };
    });

    const chartData = completeData.map((data) => data.registrations);
    const chartLabels = completeData.map((data) => data.date);

    this.registrationChartData = {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          label: this.registrationChartData.datasets[0].label,
          fill: false,
          borderColor: '#4bc0c0',
          tension: 0.1,
          type: 'line',
        },
      ],
    };
  }
}
