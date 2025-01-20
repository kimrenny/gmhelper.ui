import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-binary-animation',
  standalone: true,
  templateUrl: './binaryAnimation.component.html',
  styleUrls: ['./binaryAnimation.component.scss'],
  imports: [CommonModule],
})
export class BinaryAnimationComponent implements OnInit {
  columns: { bits: string[]; direction: 'up' | 'down' }[] = [];
  readonly columnCount: number = 10;
  readonly columnHeight: number = 15;
  readonly totalBits: number = 30;
  readonly animationDuration: number = 5;

  ngOnInit(): void {
    this.initializeColumns();
    setInterval(() => this.updateColumns(), this.animationDuration * 1000);
  }

  initializeColumns(): void {
    this.columns = Array.from({ length: this.columnCount }, (_, index) => ({
      bits: Array.from({ length: this.columnHeight }, () =>
        Math.random() > 0.5 ? '1' : '0'
      ),
      direction: index % 2 === 0 ? 'down' : 'up',
    }));
  }

  updateColumns(): void {
    this.columns.forEach((column) => {
      if (column.direction === 'down') {
        column.bits.pop();
        column.bits.unshift(Math.random() > 0.5 ? '1' : '0');
      } else {
        column.bits.shift();
        column.bits.push(Math.random() > 0.5 ? '1' : '0');
      }
    });
  }

  getBitAnimationDelay(index: number): string {
    return `${index * 0.1}s`;
  }
}
