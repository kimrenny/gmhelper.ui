import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TokenService } from './token.service';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private api = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getLoggedDevices(): Observable<any> {
    const token = this.tokenService.getTokenFromStorage('authToken');
    if (!token) {
      return throwError(() => new Error('Token does not exist'));
    }

    return this.http.get<any[]>(`${this.api}/user/devices`, {
      headers: this.tokenService.createAuthHeaders(token),
    });
  }

  deactivateDevice(device: any): Observable<any> {
    const token = this.tokenService.getTokenFromStorage('authToken');
    if (!token) {
      return throwError(() => new Error('Token does not exist'));
    }

    return this.http.patch(
      `${this.api}/user/devices/deactivate`,
      {
        userAgent: device.userAgent,
        platform: device.platform,
        ipAddress: device.ipAddress,
      },
      { headers: this.tokenService.createAuthHeaders(token) }
    );
  }
}
