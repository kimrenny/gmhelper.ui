import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private selectedSubject$ = new BehaviorSubject<'Math' | 'Geo' | null>(null);

  setSubject(subject: 'Math' | 'Geo') {
    this.selectedSubject$.next(subject);
  }

  getSubject() {
    return this.selectedSubject$.asObservable();
  }

  getCurrentSubject() {
    return this.selectedSubject$.getValue();
  }
}
