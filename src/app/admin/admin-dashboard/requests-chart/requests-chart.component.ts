import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
  imports: [CommonModule, TranslateModule],
  templateUrl: './requests-chart.component.html',
  styleUrls: ['./requests-chart.component.scss'],
})
export class RequestsChartComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  userRole: string | any;
  selectedPeriod: string = 'week';

  private currentDataRegular: RequestsData[] = [];
  private currentDataAdmin: RequestsData[] = [];
  private isDaily: boolean = true;
  private isMonthly: boolean = false;

  private subscriptions = new Subscription();

  constructor(
    private adminService: AdminService,
    private tokenService: TokenService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    const roleSub = this.tokenService.userRole$.subscribe((role) => {
      this.userRole = role;
      if (this.userRole === 'Admin' || this.userRole === 'Owner') {
        this.loadRequestsData();
      }
    });

    const langSub = this.translateService.onLangChange.subscribe(() => {
      this.updateChartData(
        this.currentDataRegular,
        this.currentDataAdmin,
        this.isDaily,
        this.isMonthly
      );
    });

    this.subscriptions.add(roleSub);
    this.subscriptions.add(langSub);
  }

  private loadRequestsData() {
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

  ngAfterViewInit(): void {
    this.createChart();

    if (this.currentDataRegular.length && this.currentDataAdmin.length) {
      this.updateChartData(
        this.currentDataRegular,
        this.currentDataAdmin,
        this.isDaily,
        this.isMonthly
      );
    }
  }

  private createChart(): void {
    if (!this.chartCanvas) return;

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            label: this.translateService.instant(
              'ADMIN.DASHBOARD.REQUESTS.CHART.REGULAR.TITLE'
            ),
            borderColor: '#4bc0c0',
            tension: 0.1,
            fill: false,
          },
          {
            data: [],
            label: this.translateService.instant(
              'ADMIN.DASHBOARD.REQUESTS.CHART.ADMIN.TITLE'
            ),
            borderColor: '#9b51e0',
            tension: 0.1,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: this.translateService.instant(
                'ADMIN.DASHBOARD.REQUESTS.CHART.X_AXIS'
              ),
            },
          },
          y: {
            title: {
              display: true,
              text: this.translateService.instant(
                'ADMIN.DASHBOARD.REQUESTS.CHART.Y_AXIS'
              ),
            },
            beginAtZero: true,
          },
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.chart?.destroy();
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

  private updateChartData(
    filteredDataRegular: RequestsData[],
    filteredDataAdmin: RequestsData[],
    isDaily: boolean,
    isMonthly: boolean
  ): void {
    this.currentDataRegular = filteredDataRegular;
    this.currentDataAdmin = filteredDataAdmin;
    this.isDaily = isDaily;
    this.isMonthly = isMonthly;

    if (!this.chart) return;

    const labels = filteredDataRegular.map((d) => d.date);
    const dataRegular = filteredDataRegular.map((d) => d.count);
    const dataAdmin = filteredDataAdmin.map((d) => d.count);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = dataRegular;
    this.chart.data.datasets[0].label = this.translateService.instant(
      'ADMIN.DASHBOARD.REQUESTS.CHART.REGULAR.TITLE'
    );
    this.chart.data.datasets[1].data = dataAdmin;
    this.chart.data.datasets[1].label = this.translateService.instant(
      'ADMIN.DASHBOARD.REQUESTS.CHART.ADMIN.TITLE'
    );

    (this.chart.options.scales!['x'] as any).title!.text =
      this.translateService.instant('ADMIN.DASHBOARD.REQUESTS.CHART.X_AXIS');
    (this.chart.options.scales!['y'] as any).title!.text =
      this.translateService.instant('ADMIN.DASHBOARD.REQUESTS.CHART.Y_AXIS');

    this.chart.update();
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
}
