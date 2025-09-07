import { inject, Injectable } from '@angular/core';
import { Coords2d } from '../drawing-tools/types/coords.type';
import {
  BehaviorSubject,
  catchError,
  firstValueFrom,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from 'src/app/models/api-response.model';
import { environment } from 'src/environments/environment';
import { TokenService } from 'src/app/services/token.service';
import { CanvasService } from '../services/math-canvas/canvas.service';

@Injectable({
  providedIn: 'root',
})
export class MathCanvasSolutionService {
  private api = `${environment.apiUrl}`;
  private http = inject(HttpClient);

  taskId$ = this.canvasService.taskId$;

  private latexSolution: string = '';

  constructor(
    private canvasService: CanvasService,
    private tokenService: TokenService
  ) {}

  public getTaskFromApi(id: string): Observable<boolean> {
    return this.http.get<ApiResponse<any>>(`${this.api}/tasks/math/${id}`).pipe(
      tap((res) => {
        if (res.success) {
          this.latexSolution = res.data.data;
        } else {
          console.warn('Server rejected request:', res.message);
        }
      }),
      map((res) => res.success),
      catchError((err) => {
        console.error('HTTP error while sending task:', err);
        return of(false);
      })
    );
  }

  getLatexSolution(): string {
    return this.latexSolution;
  }

  rateSolution(isCorrect: boolean): Observable<any> {
    const token = this.tokenService.getTokenFromStorage('authToken');
    if (!token) {
      return throwError(() => new Error('USER_NOT_AUTHORIZED_CLIENT'));
    }

    return from(firstValueFrom(this.taskId$)).pipe(
      switchMap((taskId) => {
        if (!taskId) {
          return throwError(() => new Error('taskId is empty'));
        }
        const url = `${this.api}/tasks/math/${taskId}/rating`;
        const body = { isCorrect };
        const headers = this.tokenService.createAuthHeaders(token);
        return this.http.post(url, body, { headers });
      })
    );
  }

  clear(): void {
    this.canvasService.updateTaskId(null);
  }
}
