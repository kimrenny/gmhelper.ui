import { Observable } from 'rxjs';

export type SubjectType = 'Math' | 'Geo' | null;

export interface SubjectServiceInterface {
  setSubject(subject: Exclude<SubjectType, null>): void;
  getSubject(): Observable<Exclude<SubjectType, null> | null>;
  getCurrentSubject(): SubjectType;
}
