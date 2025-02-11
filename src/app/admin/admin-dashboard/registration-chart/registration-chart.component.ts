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
          display: false,
          text: '',
        },
      },
      y: {
        title: {
          display: false,
          text: '',
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
              this.filterDataByDays(registrations, 7);
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

  private filterDataByDays(data: RegistrationData[], days: number): void {
    console.log('filterDataByDays input: ', data);
    const currentDate = new Date();
    const dateAgo = new Date(currentDate);
    dateAgo.setDate(currentDate.getDate() - days);

    const dateData: RegistrationData[] = [];

    for (
      let d = new Date(dateAgo);
      d <= currentDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateString = d.toISOString().split('T')[0];

      const dayData = data.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate.toISOString().split('T')[0] === dateString;
      });

      dateData.push({
        date: dateString,
        registrations:
          dayData.length > 0
            ? dayData.reduce((acc, item) => acc + item.registrations, 0)
            : 0,
      });

      console.log('filterDataByDays output: ', dateData);
      this.updateChartData(dateData, true, false);
    }
  }

  private filterDataBySixMonths(data: RegistrationData[]): void {
    let filteredData = [...data];

    filteredData = this.processData(data, 6, true);
    this.updateChartData(filteredData, false, true);
  }

  private filterDataByYear(data: RegistrationData[]): void {
    let filteredData = [...data];

    filteredData = this.processData(data, 12, true);
    this.updateChartData(filteredData, false, true);
  }

  private filterDataByFiveYears(data: RegistrationData[]): void {
    let filteredData = [...data];

    filteredData = this.processData(data, 5, false);
    this.updateChartData(filteredData, false, false);
  }

  private filterDataByPeriod(data: RegistrationData[], period: string): void {
    const currentDate = new Date();
    let filteredData = [...data];

    switch (period) {
      case 'week': {
        this.filterDataByDays(data, 7);
        break;
      }

      case 'month': {
        this.filterDataByDays(data, 30);
        break;
      }

      case '6months': {
        this.filterDataBySixMonths(data);
        break;
      }

      case 'year': {
        this.filterDataByYear(data);
        break;
      }

      case '5years': {
        this.filterDataByFiveYears(data);
        break;
      }
      case 'all': {
        const firstDate = new Date(data[0]?.date || currentDate);
        const daysDiff = currentDate.getDate() - firstDate.getDate();

        if (daysDiff <= 7) {
          this.filterDataByDays(data, 7);
        } else if (daysDiff <= 30) {
          this.filterDataByDays(data, 30);
        } else if (daysDiff <= 180) {
          this.filterDataBySixMonths(data);
        } else if (daysDiff <= 365) {
          this.filterDataByYear(data);
        } else if (daysDiff <= 365 * 4 + 1) {
          this.filterDataByFiveYears(data);
        }
        break;
      }
      default:
        filteredData = [...data];
        this.updateChartData(filteredData, true, false);
    }
  }

  private processData(
    filteredData: RegistrationData[],
    periodLength: number,
    isMonthly: boolean
  ): RegistrationData[] {
    if (filteredData.length < 1) return [];

    const data: { [key: string]: number } = {};

    filteredData.forEach(({ date, registrations }) => {
      const key = isMonthly ? date.slice(0, 7) : date.slice(0, 4);
      data[key] = (data[key] || 0) + registrations;
    });

    let result = Object.entries(data)
      .map(([date, registrations]) => ({ date, registrations }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const now = new Date();
    const lastPeriod: string[] = [];

    for (let i = periodLength - 1; i >= 0; i--) {
      const date = new Date(now);

      if (isMonthly) {
        date.setMonth(now.getMonth() - i);
        const periodKey = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`;
        lastPeriod.push(periodKey);
      } else {
        date.setFullYear(now.getFullYear() - i);
        const periodKey = `${date.getFullYear()}`;
        lastPeriod.push(periodKey);
      }
    }

    lastPeriod.forEach((period) => {
      if (!result.some((d) => d.date === period)) {
        result.push({ date: period, registrations: 0 });
      }
    });

    result.sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }

  private updateChartData(
    filteredData: any[],
    isDaily: boolean,
    isMonthly: boolean
  ): void {
    const startDate = isDaily
      ? new Date(filteredData[0]?.date || new Date())
      : new Date(
          filteredData[0]?.date + (isMonthly ? '-01' : '-01-01') || new Date()
        );

    const endDate = new Date();

    const allDates: string[] = [];
    const dateCursor = new Date(startDate);

    if (isDaily) {
      while (dateCursor <= endDate) {
        allDates.push(dateCursor.toISOString().split('T')[0]);
        dateCursor.setDate(dateCursor.getDate() + 1);
      }
    } else {
      while (dateCursor <= endDate) {
        const periodKey = isMonthly
          ? `${dateCursor.getFullYear()}-${(dateCursor.getMonth() + 1)
              .toString()
              .padStart(2, '0')}`
          : `${dateCursor.getFullYear()}`;

        allDates.push(periodKey);
        if (isMonthly) {
          dateCursor.setMonth(dateCursor.getMonth() + 1);
        } else {
          dateCursor.setFullYear(dateCursor.getFullYear() + 1);
        }
      }
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
