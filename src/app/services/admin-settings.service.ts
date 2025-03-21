import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminSettingsService {
  private apiUrl = 'https://localhost:7057/api/admin/settings';
  private settingsSubject = new BehaviorSubject<boolean[][]>([]);
  settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getSettings(): Observable<boolean[][]> {
    return this.http
      .get<boolean[][]>(this.apiUrl)
      .pipe(tap((settings) => this.settingsSubject.next(settings)));
  }

  updateSwitchValue(sectionIndex: number, switchIndex: number, value: boolean) {
    const currentSettings = this.settingsSubject.getValue();
    if (currentSettings[sectionIndex]) {
      currentSettings[sectionIndex][switchIndex] = value;
      this.settingsSubject.next({ ...currentSettings });
    }
  }

  saveSettings(): Observable<void> {
    return this.http.patch<void>(this.apiUrl, this.settingsSubject.getValue());
  }
}
