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

  resetCounter(): void {
    this.figureCounter = 0;
  }
}
