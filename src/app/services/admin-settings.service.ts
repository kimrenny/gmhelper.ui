import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { TokenService } from './token.service';

interface AdminSettings {
  settings: boolean[][];
}

@Injectable({
  providedIn: 'root',
})
export class AdminSettingsService {
  private apiUrl = 'https://localhost:7057/api/admin';
  private settingsSubject = new BehaviorSubject<AdminSettings | null>(null);
  settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getSettings(returnData: boolean = false): Observable<AdminSettings | null> {
    const authToken = this.tokenService.getTokenFromStorage('authToken');

    if (!authToken) {
      return new Observable<AdminSettings | null>((observer) => {
        observer.next(null);
        observer.complete();
      });
    }

    if (returnData) {
      return this.tokenService.userRole$.pipe(
        switchMap((role) => {
          if (this.checkAdminPermissions(role)) {
            return this.http
              .get<ApiResponse<AdminSettings>>(`${this.apiUrl}/settings`, {
                headers: this.tokenService.createAuthHeaders(authToken),
              })
              .pipe(map((response) => response.data));
          } else {
            return new Observable<AdminSettings | null>((observer) => {
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
              .get<ApiResponse<AdminSettings>>(`${this.apiUrl}/settings`, {
                headers: this.tokenService.createAuthHeaders(authToken),
              })
              .pipe(map((response) => response.data));
          } else {
            return new Observable<AdminSettings | null>((observer) => {
              observer.next(null);
              observer.complete();
            });
          }
        })
      )
      .subscribe((data) => {
        this.settingsSubject.next(data);
      });

    return new Observable<AdminSettings | null>((observer) => {
      observer.next(null);
      observer.complete();
    });
  }

  getSettingsData(): Observable<AdminSettings | null> {
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

  checkAdminPermissions(role: string | null): boolean {
    return role == 'Admin' || role == 'Owner';
  }
}
