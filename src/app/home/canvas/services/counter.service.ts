import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CounterService {
  private figureCounter: number = 0;

  getNextFigureName(figure: string): string {
    const figureNumber = this.figureCounter;
    this.figureCounter++;
    return `${figure}_${figureNumber}`;
  }

  incrementCounter(): void {
    this.figureCounter++;
  }

  decrementCounter(): void {
    this.figureCounter--;
  }

  resetCounter(): void {
    this.figureCounter = 0;
  }
}
