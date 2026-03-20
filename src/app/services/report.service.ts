import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  submitReport(reportText: string, clientInfo: any | null = null) {
    if (!reportText.trim()) {
      return throwError(() => new Error('Report text cannot be empty'));
    }

    if (reportText.length > 500) {
      return throwError(() => new Error('Report text cannot exceed 500 characters'));
    }

    const payload: any = { 
      report: reportText 
    };

    if (clientInfo){
      payload.clientInfo = clientInfo;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    console.log('Submitting report with payload:', payload);

    return this.http.post<ApiResponse<any>>(
      `${this.api}/report/notfound`, 
      payload, 
      { headers }
    );
  }
}
