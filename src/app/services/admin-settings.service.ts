import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminSettingsService {
  private apiUrl = `${environment.apiUrl}/admin`;
  private settingsSubject = new BehaviorSubject<boolean[][] | null>(null);
  settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  loadSettings(): void {
    this.tokenService
      .getToken$()
      .pipe(
        take(1),
        switchMap((token) => {
          if (!token || !this.checkAdminPermissions(token)) {
            this.settingsSubject.next(null);
            return of(null);
          }

          return this.http
            .get<ApiResponse<boolean[][]>>(`${this.apiUrl}/settings`, {
              headers: this.tokenService.createAuthHeaders(token),
            })
            .pipe(map((response) => response.data));
        })
      )
      .subscribe((settings) => {
        if (settings) this.settingsSubject.next(settings);
      });
  }

  getSettingsData(): Observable<boolean[][] | null> {
    return this.settings$;
  }

  updateSwitch(
    sectionTitle: string,
    switchLabel: string,
    newValue: boolean
  ): Observable<void> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) return of(void 0);

        return this.http.patch<void>(
          `${this.apiUrl}/settings/${sectionTitle}/${switchLabel}`,
          { newValue },
          { headers: this.tokenService.createAuthHeaders(token) }
        );
      })
    );
  }

  updateSettings(
    sectionTitle: string,
    switchLabel: string,
    newValue: boolean
  ): void {
    const currentSettings = this.settingsSubject.value;

    if (currentSettings) {
      const sectionIndex = this.getSectionIndexByTitle(sectionTitle);
      const switchIndex = this.getSwitchIndexByLabel(sectionTitle, switchLabel);

      if (sectionIndex !== -1 && switchIndex !== -1) {
        currentSettings[sectionIndex][switchIndex] = newValue;
        this.settingsSubject.next(currentSettings);
      }
    }
  }

  private getSectionIndexByTitle(title: string): number {
    const sectionTitles = ['Dashboard', 'Users', 'Tokens', 'Logs'];
    return sectionTitles.indexOf(title);
  }

  private getSwitchIndexByLabel(title: string, label: string): number {
    const sections = [
      {
        title: 'Dashboard',
        switches: [
          { label: 'Requests' },
          { label: 'Tokens' },
          { label: 'Banned' },
          { label: 'Roles' },
          { label: 'Country' },
        ],
      },
      {
        title: 'Users',
        switches: [
          { label: 'Username' },
          { label: 'Email' },
          { label: 'Registration' },
          { label: 'Modal' },
          { label: 'Modal: Token' },
        ],
      },
      {
        title: 'Tokens',
        switches: [
          { label: 'Token' },
          { label: 'Expirations' },
          { label: 'User ID' },
          { label: 'Modal' },
          { label: 'Actions' },
        ],
      },
      {
        title: 'Logs',
        switches: [
          { label: 'Timestamp' },
          { label: 'Duration' },
          { label: 'Request' },
          { label: 'User ID' },
          { label: 'Modal' },
        ],
      },
    ];

    const section = sections.find((s) => s.title === title);

    if (section) {
      const switchIndex = section.switches.findIndex((s) => s.label === label);

      return switchIndex;
    }

    return -1;
  }

  checkAdminPermissions(token: string): boolean {
    const role = this.tokenService.extractUserRole(token);
    return role == 'Admin' || role == 'Owner';
  }
}
