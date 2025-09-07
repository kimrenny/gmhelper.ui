import { inject, Injectable } from '@angular/core';
import { Coords2d } from '../../drawing-tools/types/coords.type';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from 'src/app/models/api-response.model';
import { environment } from 'src/environments/environment';
import { TokenService } from 'src/app/services/token.service';
import { isLatexValid } from '../../utils/latex-validation.utils';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  private latex: string = '';

  private taskIdSubject = new BehaviorSubject<string | null>(null);
  taskId$ = this.taskIdSubject.asObservable();

  private isProcessingSubject = new BehaviorSubject<boolean>(false);
  isProcessing$ = this.isProcessingSubject.asObservable();

  private api = `${environment.apiUrl}`;
  private http = inject(HttpClient);

  constructor(private tokenService: TokenService) {}

  setLatex(latex: string) {
    this.latex = latex;
  }

  exportTaskJson(): Observable<ApiResponse<any>> {
    this.isProcessingSubject.next(true);
    return this.sendTaskToApi().pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.isProcessingSubject.next(false);
        }
      }),
      catchError((err) => {
        this.isProcessingSubject.next(false);
        return throwError(() => err);
      })
    );
  }

  private sendTaskToApi() {
    const token = this.tokenService.getTokenFromStorage('authToken');

    const options = token
      ? { headers: this.tokenService.createAuthHeaders(token) }
      : {};

    const data = this.serializeTaskJson();

    if (data) {
      return this.http.post<ApiResponse<string>>(
        `${this.api}/tasks/math`,
        data,
        options
      );
    }

    return throwError('LaTeX is not valid.');
  }

  serializeTaskJson(): any {
    if (isLatexValid(this.latex)) {
      return { data: this.latex };
    }

    return null;
  }

  public updateTaskId(id: string | null): void {
    this.taskIdSubject.next(id);
  }
}
