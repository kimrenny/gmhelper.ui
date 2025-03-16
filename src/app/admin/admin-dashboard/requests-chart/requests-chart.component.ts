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
import { filterDataByDays } from './filter/filter';
import { processData } from './process/process';

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

interface RequestsData {
  date: string;
  count: number;
}

interface CombinedRequestsData {
  regular: RequestsData[];
  admin: RequestsData[];
}

@Component({
  selector: 'app-requests-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, TranslateModule],
  templateUrl: './requests-chart.component.html',
  styleUrls: ['./requests-chart.component.scss'],
})
export class RequestsChartComponent implements OnInit, OnDestroy {
  userRole: string | any;
  selectedPeriod: string = 'week';

  requestsChartData: any = {
    datasets: [
      {
        data: [],
        label: 'Requests',
        fill: false,
        borderColor: '#4bc0c0',
        tension: 0.1,
        type: 'line',
      },
    ],
  };

  requestsChartOptions: any = {
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
    this.applyTranslations();

    const roleSub = this.tokenService.userRole$.subscribe((role) => {
      this.userRole = role;
      if (this.userRole === 'Admin' || this.userRole === 'Owner') {
        this.adminService.checkRequestsData();

        this.adminService.getRequestsDataObservable().subscribe((data) => {
          console.log(data);
          if (data?.regular) {
            this.updateChartData(
              filterDataByDays(data?.regular, 7),
              true,
              false
            );
          }
        });
      }
    });

    const langSub = this.translateService.onLangChange.subscribe(() => {
      this.applyTranslations();
    });

    this.subscriptions.add(roleSub);
    this.subscriptions.add(langSub);
  }

  private applyTranslations(): void {
    this.requestsChartOptions.scales.x.title.text =
      this.translateService.instant('ADMIN.DASHBOARD.REQUESTS.CHART.X_AXIS');
    this.requestsChartOptions.scales.y.title.text =
      this.translateService.instant('ADMIN.DASHBOARD.REQUESTS.CHART.Y_AXIS');
    this.requestsChartData.datasets[0].label = this.translateService.instant(
      'ADMIN.DASHBOARD.REQUESTS.CHART.TITLE'
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onPeriodChange(event: Event): void {
    const selectedPeriod = (event.target as HTMLSelectElement).value;
    this.selectedPeriod = selectedPeriod;

    this.adminService.getRequestsDataObservable().subscribe((data) => {
      console.log(data);
      if (data) {
        this.filterDataByPeriod(data?.regular, this.selectedPeriod);
      }
    });
  }

  private filterDataBySixMonths(data: RequestsData[]): void {
    let filteredData = [...data];

    filteredData = processData(data, 6, true);
    this.updateChartData(filteredData, false, true);
  }

  private filterDataByYear(data: RequestsData[]): void {
    let filteredData = [...data];

    filteredData = processData(data, 12, true);
    this.updateChartData(filteredData, false, true);
  }

  private filterDataByFiveYears(data: RequestsData[]): void {
    let filteredData = [...data];

    filteredData = processData(data, 5, false);
    this.updateChartData(filteredData, false, false);
  }

  private filterDataByPeriod(data: RequestsData[], period: string): void {
    const currentDate = new Date();
    let filteredData = [...data];

    switch (period) {
      case 'week': {
        this.updateChartData(filterDataByDays(data, 7), true, false);
        break;
      }

      case 'month': {
        this.updateChartData(filterDataByDays(data, 30), true, false);
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
          this.updateChartData(filterDataByDays(data, 7), true, false);
        } else if (daysDiff <= 30) {
          this.updateChartData(filterDataByDays(data, 30), true, false);
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
      return existing ? existing : { date, count: 0 };
    });

    const chartData = completeData.map((data) => data.count);
    const chartLabels = completeData.map((data) => data.date);

    this.requestsChartData = {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          label: this.requestsChartData.datasets[0].label,
          fill: false,
          borderColor: '#4bc0c0',
          tension: 0.1,
          type: 'line',
        },
      ],
    };
  }
}
