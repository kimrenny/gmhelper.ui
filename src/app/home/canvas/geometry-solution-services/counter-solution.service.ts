import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CounterService {
  private figureCounter: number = 0;

  getCurrentFigureCounter(): number {
    return this.figureCounter;
  }

  getNextFigureName(figure: string): string {
    const figureNumber = this.figureCounter;
    this.figureCounter++;
    return `${figure}_${figureNumber}`;
  }

  setCounterFromFigures(figureNames: string[]): void {
    const numbers = figureNames
      .map((name) => {
        const parts = name.split('_');
        const num = Number(parts[1]);
        return isNaN(num) ? -1 : num;
      })
      .filter((n) => n >= 0);

    const max = numbers.length > 0 ? Math.max(...numbers) : -1;
    this.figureCounter = max + 1;
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
