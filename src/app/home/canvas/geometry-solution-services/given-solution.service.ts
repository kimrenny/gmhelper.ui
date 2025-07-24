import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GivenSolutionService {
  private givenText: string = '';

  setGiven(text: string): void {
    this.givenText = text;
  }

  getGiven(): string {
    return this.givenText;
  }

  clear(): void {
    this.givenText = '';
  }
}
