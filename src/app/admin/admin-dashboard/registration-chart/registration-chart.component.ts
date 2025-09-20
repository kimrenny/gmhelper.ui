import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from 'src/app/services/admin.service';
import { TokenService } from 'src/app/services/token.service';
import { combineLatest, Subscription } from 'rxjs';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { select, Store } from '@ngrx/store';
import * as AdminState from 'src/app/store/admin/admin.state';
import * as AdminActions from 'src/app/store/admin/admin.actions';
import {
  selectIsLoaded,
  selectRegistrations,
} from 'src/app/store/admin/admin.selectors';

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
  imports: [CommonModule, TranslateModule],
  templateUrl: './registration-chart.component.html',
  styleUrls: ['./registration-chart.component.scss'],
})
export class RegistrationChartComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('chartCanvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  selectedPeriod: string = 'week';
  private currentData: RegistrationData[] = [];
  private isDaily: boolean = true;
  private isMonthly: boolean = false;
  private subscriptions = new Subscription();

  constructor(
    private store: Store<AdminState.AdminState>,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      combineLatest([
        this.store.pipe(select(selectRegistrations)),
        this.store.pipe(select(selectIsLoaded)),
      ]).subscribe(([registrations, isLoaded]) => {
        if (!registrations && isLoaded) {
          this.store.dispatch(AdminActions.loadRegistrations());
        } else if (registrations) {
          this.filterDataByPeriod(registrations, this.selectedPeriod);
        }
      })
    );

    const langSub = this.translateService.onLangChange.subscribe(() => {
      this.updateChartData(this.currentData, this.isDaily, this.isMonthly);
    });

    this.subscriptions.add(langSub);
  }

  ngAfterViewInit(): void {
    this.createChart();
    if (this.currentData.length) {
      this.updateChartData(this.currentData, this.isDaily, this.isMonthly);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.chart?.destroy();
  }

  onPeriodChange(event: Event): void {
    const period = (event.target as HTMLSelectElement).value;
    this.selectedPeriod = period;

    combineLatest([
      this.store.pipe(select(selectRegistrations)),
      this.store.pipe(select(selectIsLoaded)),
    ]).subscribe(([registrations, isLoaded]) => {
      if (!registrations && isLoaded) {
        this.store.dispatch(AdminActions.loadRegistrations());
      } else if (registrations) {
        this.filterDataByPeriod(registrations, this.selectedPeriod);
      }
    });
  }

  private createChart(): void {
    if (!this.canvas) return;

    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            label: '',
            borderColor: '#4bc0c0',
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: this.translateService.instant(
                'ADMIN.DASHBOARD.REGISTRATIONS.CHART.X_AXIS'
              ),
            },
          },
          y: {
            type: 'linear',
            min: 0,
            title: {
              display: true,
              text: this.translateService.instant(
                'ADMIN.DASHBOARD.REGISTRATIONS.CHART.Y_AXIS'
              ),
            },
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  }

  private updateChartData(
    filteredData: RegistrationData[],
    isDaily: boolean,
    isMonthly: boolean
  ): void {
    this.currentData = filteredData;
    this.isDaily = isDaily;
    this.isMonthly = isMonthly;

    if (!this.chart) return;

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
        if (isMonthly) dateCursor.setMonth(dateCursor.getMonth() + 1);
        else dateCursor.setFullYear(dateCursor.getFullYear() + 1);
      }
    }

    const completeData = allDates.map((date) => {
      const existing = filteredData.find((d) => d.date === date);
      return existing ? existing.registrations : 0;
    });

    if (!this.chart.data.datasets[0])
      this.chart.data.datasets[0] = { data: [], label: '' };

    this.chart.data.labels = allDates;
    this.chart.data.datasets[0].data = completeData;
    this.chart.data.datasets[0].label = this.translateService.instant(
      'ADMIN.DASHBOARD.REGISTRATIONS.CHART.TITLE'
    );
    (this.chart.options!.scales!['x'] as any).title!.text =
      this.translateService.instant(
        'ADMIN.DASHBOARD.REGISTRATIONS.CHART.X_AXIS'
      );

    (this.chart.options!.scales!['y'] as any).title!.text =
      this.translateService.instant(
        'ADMIN.DASHBOARD.REGISTRATIONS.CHART.Y_AXIS'
      );

    this.chart.update();
  }

  private filterDataByDays(data: RegistrationData[], days: number): void {
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
}
