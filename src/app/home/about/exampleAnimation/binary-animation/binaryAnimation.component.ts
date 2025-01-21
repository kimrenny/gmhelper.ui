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
  readonly animationDuration: number = 2;

  ngOnInit(): void {
    this.initializeColumns();
    this.updateColumns();
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
    const bitUpdateInterval =
      (this.animationDuration * 1000) / this.columnHeight;

    this.columns.forEach((column, columnIndex) => {
      setInterval(() => {
        if (column.direction === 'down') {
          const newBit = Math.random() > 0.5 ? '1' : '0';
          column.bits.pop();
          column.bits.unshift(newBit);
        } else {
          const newBit = Math.random() > 0.5 ? '1' : '0';
          column.bits.shift();
          column.bits.push(newBit);
        }
      }, bitUpdateInterval + columnIndex * 50);
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  getBitAnimationDelay(index: number): string {
    return `${index * 0.1}s`;
  }
}
