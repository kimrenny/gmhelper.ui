import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlaceholderIdService {
  private counter = 0;

  reset(): void {
    this.counter = 0;
  }

  getNextId(): number {
    this.counter++;
    return this.counter;
  }

  getCurrentCounter(): number {
    return this.counter;
  }

  incrementCounter(): void {
    this.counter++;
  }

  decrementCounter(): void {
    this.counter--;
  }
}
