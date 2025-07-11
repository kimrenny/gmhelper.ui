export interface CounterServiceInterface {
  getCurrentFigureCounter(): number;
  getNextFigureName(figure: string): string;
  setCounterFromFigures(figureNames: string[]): void;
  incrementCounter(): void;
  decrementCounter(): void;
  resetCounter(): void;
}
