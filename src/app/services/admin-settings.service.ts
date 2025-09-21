import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';
import { AdminSettings } from '../models/admin.model';

@Injectable({
  providedIn: 'root',
})
export class AdminSettingsService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  loadSettings(): Observable<AdminSettings> {
    return this.tokenService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token || !this.checkAdminPermissions(token)) {
          return throwError(() => new Error('No permissions'));
        }

        return this.http
          .get<ApiResponse<AdminSettings>>(`${this.apiUrl}/settings`, {
            headers: this.tokenService.createAuthHeaders(token),
          })
          .pipe(map((response) => response.data));
      })
    );
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
          `${
            this.apiUrl
          }/settings/${sectionTitle.toLowerCase()}/${switchLabel.toLowerCase()}`,
          { newValue },
          { headers: this.tokenService.createAuthHeaders(token) }
        );
      })
    );
  }

  checkAdminPermissions(token: string): boolean {
    const role = this.tokenService.extractUserRole(token);
    return role == 'Admin' || role == 'Owner';
  }
}
