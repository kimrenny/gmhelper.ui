import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AboutService } from 'src/app/services/about.service';

@Component({
  selector: 'app-binary-animation',
  standalone: true,
  templateUrl: './binaryAnimation.component.html',
  styleUrls: ['./binaryAnimation.component.scss'],
  imports: [CommonModule],
})
export class BinaryAnimationComponent implements OnInit, OnDestroy {
  columns: { bits: string[]; direction: 'up' | 'down'; intervalId?: number }[] =
    [];
  readonly columnCount: number = 10;
  readonly columnHeight: number = 15;
  readonly animationDuration: number = 2000;

  private isComponentVisible: boolean = false;
  private visibilitySubscription: Subscription | null = null;

  constructor(private aboutService: AboutService) {}

  ngOnInit(): void {
    this.initializeColumns();
    this.subscribeToVisibility();
  }

  ngOnDestroy(): void {
    this.visibilitySubscription?.unsubscribe();
  }

  initializeColumns(): void {
    this.columns = Array.from({ length: this.columnCount }, (_, index) => ({
      bits: Array.from({ length: this.columnHeight }, () =>
        Math.random() > 0.5 ? '1' : '0'
      ),
      direction: index % 2 === 0 ? 'down' : 'up',
    }));
  }

  startAnimation(): void {
    const bitUpdateInterval =
      (this.animationDuration * 1000) / this.columnHeight;

    this.columns.forEach((column, columnIndex) => {
      column.intervalId = setInterval(() => {
        if (this.isComponentVisible) {
          if (column.direction === 'down') {
            const newBit = Math.random() > 0.5 ? '1' : '0';
            column.bits.pop();
            column.bits.unshift(newBit);
          } else {
            const newBit = Math.random() > 0.5 ? '1' : '0';
            column.bits.shift();
            column.bits.push(newBit);
          }
        }
      }, bitUpdateInterval + columnIndex * 50) as unknown as number;
    });
  }

  stopAnimation(): void {
    this.columns.forEach((column) => {
      if (column['intervalId']) {
        clearInterval(column['intervalId']);
        delete column.intervalId;
      }
    });
  }

  subscribeToVisibility(): void {
    this.visibilitySubscription =
      this.aboutService.componentVisibility$.subscribe((isActive) => {
        this.isComponentVisible = isActive;
        if (isActive) {
          this.startAnimation();
        } else {
          this.stopAnimation();
        }
      });
  }

  trackByIndex(index: number): number {
    return index;
  }

  getBitAnimationDelay(index: number): string {
    return `${index * 0.1}s`;
  }
}
