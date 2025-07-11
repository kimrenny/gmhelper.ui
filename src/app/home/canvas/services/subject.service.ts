import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SubjectServiceInterface } from '../interfaces/subject-service.interface';

@Injectable({ providedIn: 'root' })
export class SubjectService implements SubjectServiceInterface {
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
