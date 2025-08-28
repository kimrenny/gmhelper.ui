import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';

// interface AdminSettings {
//   settings: boolean[][];
// }

@Injectable({
  providedIn: 'root',
})
export class AdminSettingsService {
  private apiUrl = `${environment.apiUrl}/api/admin`;
  private settingsSubject = new BehaviorSubject<boolean[][] | null>(null);
  settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getSettings(returnData: boolean = false): Observable<boolean[][] | null> {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return new Observable<boolean[][] | null>((observer) => {
        observer.next(null);
        observer.complete();
      });
    }

    if (!returnData && this.settingsSubject.value) return this.settings$;

    if (returnData) {
      return this.tokenService.userRole$.pipe(
        switchMap((role) => {
          if (this.checkAdminPermissions(role)) {
            return this.http
              .get<ApiResponse<boolean[][]>>(`${this.apiUrl}/settings`, {
                headers: this.tokenService.createAuthHeaders(authToken),
              })
              .pipe(map((response) => response.data));
          } else {
            return new Observable<boolean[][] | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      );
    }

    this.tokenService.userRole$
      .pipe(
        switchMap((role) => {
          if (this.checkAdminPermissions(role)) {
            return this.http
              .get<ApiResponse<boolean[][]>>(`${this.apiUrl}/settings`, {
                headers: this.tokenService.createAuthHeaders(authToken),
              })
              .pipe(map((response) => response.data));
          } else {
            return new Observable<boolean[][] | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((data) => {
        this.settingsSubject.next(data);
      });

    return new Observable<boolean[][] | null>((observer) => {
      observer.next(null);
      observer.complete();
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
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return new Observable<void>((observer) => {
        observer.complete();
      });
    }

    const body = {
      sectionTitle: sectionTitle,
      switchLabel: switchLabel,
      newValue: newValue,
    };

    return this.tokenService.userRole$.pipe(
      switchMap((role) => {
        if (this.checkAdminPermissions(role)) {
          return this.http.patch<void>(`${this.apiUrl}/settings`, body, {
            headers: this.tokenService.createAuthHeaders(authToken),
          });
        } else {
          return new Observable<void>((observer) => {
            observer.complete();
          });
        }
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

  checkAdminPermissions(role: string | null): boolean {
    return role == 'Admin' || role == 'Owner';
  }
}
