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
        label: 'Regular Requests',
        fill: false,
        borderColor: '#4bc0c0',
        tension: 0.1,
        type: 'line',
      },
      {
        data: [],
        label: 'Admin Requests',
        fill: false,
        borderColor: '#9b51e0',
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
        this.adminService.getRequestsDataObservable().subscribe((data) => {
          if (data?.regular && data?.admin) {
            this.updateChartData(
              filterDataByDays(data?.regular, 7),
              filterDataByDays(data?.admin, 7),
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
      'ADMIN.DASHBOARD.REQUESTS.CHART.REGULAR.TITLE'
    );
    this.requestsChartData.datasets[1].label = this.translateService.instant(
      'ADMIN.DASHBOARD.REQUESTS.CHART.ADMIN.TITLE'
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onPeriodChange(event: Event): void {
    const selectedPeriod = (event.target as HTMLSelectElement).value;
    this.selectedPeriod = selectedPeriod;

    this.adminService.getRequestsDataObservable().subscribe((data) => {
      if (data) {
        this.filterDataByPeriod(
          data?.regular,
          data?.admin,
          this.selectedPeriod
        );
      }
    });
  }

  private filterDataBySixMonths(
    dataRegular: RequestsData[],
    dataAdmin: RequestsData[]
  ): void {
    let filteredDataRegular = [...dataRegular];
    let filteredDataAdmin = [...dataAdmin];

    filteredDataRegular = processData(dataRegular, 6, true);
    filteredDataAdmin = processData(dataAdmin, 6, true);
    this.updateChartData(filteredDataRegular, filteredDataAdmin, false, true);
  }

  private filterDataByYear(
    dataRegular: RequestsData[],
    dataAdmin: RequestsData[]
  ): void {
    let filteredDataRegular = [...dataRegular];
    let filteredDataAdmin = [...dataAdmin];

    filteredDataRegular = processData(dataRegular, 12, true);
    filteredDataAdmin = processData(dataAdmin, 12, true);
    this.updateChartData(filteredDataRegular, filteredDataAdmin, false, true);
  }

  private filterDataByFiveYears(
    dataRegular: RequestsData[],
    dataAdmin: RequestsData[]
  ): void {
    let filteredDataRegular = [...dataRegular];
    let filteredDataAdmin = [...dataAdmin];

    filteredDataRegular = processData(dataRegular, 5, false);
    filteredDataAdmin = processData(dataAdmin, 5, false);
    this.updateChartData(filteredDataRegular, filteredDataAdmin, false, false);
  }

  private filterDataByPeriod(
    dataRegular: RequestsData[],
    dataAdmin: RequestsData[],
    period: string
  ): void {
    const currentDate = new Date();
    let filteredDataRegular = [...dataRegular];
    let filteredDataAdmin = [...dataAdmin];

    switch (period) {
      case 'week': {
        this.updateChartData(
          filterDataByDays(filteredDataRegular, 7),
          filterDataByDays(filteredDataAdmin, 7),
          true,
          false
        );
        break;
      }

      case 'month': {
        this.updateChartData(
          filterDataByDays(filteredDataRegular, 30),
          filterDataByDays(filteredDataAdmin, 30),
          true,
          false
        );
        break;
      }

      case '6months': {
        this.filterDataBySixMonths(filteredDataRegular, filteredDataAdmin);
        break;
      }

      case 'year': {
        this.filterDataByYear(filteredDataRegular, filteredDataAdmin);
        break;
      }

      case '5years': {
        this.filterDataByFiveYears(filteredDataRegular, filteredDataAdmin);
        break;
      }
      case 'all': {
        const firstDate = new Date(dataRegular[0]?.date || currentDate);
        const daysDiff = currentDate.getDate() - firstDate.getDate();

        if (daysDiff <= 7) {
          this.updateChartData(
            filterDataByDays(filteredDataRegular, 7),
            filterDataByDays(filteredDataAdmin, 7),
            true,
            false
          );
        } else if (daysDiff <= 30) {
          this.updateChartData(
            filterDataByDays(filteredDataRegular, 30),
            filterDataByDays(filteredDataAdmin, 30),
            true,
            false
          );
        } else if (daysDiff <= 180) {
          this.filterDataBySixMonths(filteredDataRegular, filteredDataAdmin);
        } else if (daysDiff <= 365) {
          this.filterDataByYear(filteredDataRegular, filteredDataAdmin);
        } else if (daysDiff <= 365 * 4 + 1) {
          this.filterDataByFiveYears(filteredDataRegular, filteredDataAdmin);
        }
        break;
      }
      default:
        filteredDataRegular = [...dataRegular];
        filteredDataAdmin = [...dataAdmin];
        this.updateChartData(
          filteredDataRegular,
          filteredDataAdmin,
          true,
          false
        );
    }
  }

  private updateChartData(
    filteredDataRegular: any[],
    filteredDataAdmin: any[],
    isDaily: boolean,
    isMonthly: boolean
  ): void {
    const startDateRegular = isDaily
      ? new Date(filteredDataRegular[0]?.date || new Date())
      : new Date(
          filteredDataRegular[0]?.date + (isMonthly ? '-01' : '-01-01') ||
            new Date()
        );
    const startDateAdmin = isDaily
      ? new Date(filteredDataAdmin[0]?.date || new Date())
      : new Date(
          filteredDataAdmin[0]?.date + (isMonthly ? '-01' : '-01-01') ||
            new Date()
        );

    const endDate = new Date();

    const allDatesRegular: string[] = [];
    const allDatesAdmin: string[] = [];
    const dateCursorRegular = new Date(startDateRegular);
    const dateCursorAdmin = new Date(startDateAdmin);

    if (isDaily) {
      while (dateCursorRegular <= endDate) {
        allDatesRegular.push(dateCursorRegular.toISOString().split('T')[0]);
        dateCursorRegular.setDate(dateCursorRegular.getDate() + 1);
      }

      while (dateCursorAdmin <= endDate) {
        allDatesAdmin.push(dateCursorAdmin.toISOString().split('T')[0]);
        dateCursorAdmin.setDate(dateCursorAdmin.getDate() + 1);
      }
    } else {
      while (dateCursorRegular <= endDate) {
        const periodKey = isMonthly
          ? `${dateCursorRegular.getFullYear()}-${(
              dateCursorRegular.getMonth() + 1
            )
              .toString()
              .padStart(2, '0')}`
          : `${dateCursorRegular.getFullYear()}`;

        allDatesRegular.push(periodKey);
        if (isMonthly) {
          dateCursorRegular.setMonth(dateCursorRegular.getMonth() + 1);
        } else {
          dateCursorRegular.setFullYear(dateCursorRegular.getFullYear() + 1);
        }
      }

      while (dateCursorAdmin <= endDate) {
        const periodKey = isMonthly
          ? `${dateCursorAdmin.getFullYear()}-${(dateCursorAdmin.getMonth() + 1)
              .toString()
              .padStart(2, '0')}`
          : `${dateCursorAdmin.getFullYear()}`;

        allDatesAdmin.push(periodKey);
        if (isMonthly) {
          dateCursorAdmin.setMonth(dateCursorAdmin.getMonth() + 1);
        } else {
          dateCursorAdmin.setFullYear(dateCursorAdmin.getFullYear() + 1);
        }
      }
    }

    const completeDataRegular = allDatesRegular.map((date) => {
      const existingRegular = filteredDataRegular.find((d) => d.date === date);
      return existingRegular ? existingRegular : { date, count: 0 };
    });

    const completeDataAdmin = allDatesAdmin.map((date) => {
      const existingAdmin = filteredDataAdmin.find((d) => d.date === date);
      return existingAdmin ? existingAdmin : { date, count: 0 };
    });

    const chartDataRegular = completeDataRegular.map((data) => data.count);
    const chartDataAdmin = completeDataAdmin.map((data) => data.count);
    const chartLabels = completeDataRegular.map((data) => data.date);

    this.requestsChartData = {
      labels: chartLabels,
      datasets: [
        {
          data: chartDataRegular,
          label: this.requestsChartData.datasets[0].label,
          fill: false,
          borderColor: '#4bc0c0',
          tension: 0.1,
          type: 'line',
        },
        {
          data: chartDataAdmin,
          label: this.requestsChartData.datasets[1].label,
          fill: false,
          borderColor: '#9b51e0',
          tension: 0.1,
          type: 'line',
        },
      ],
    };
  }
}
