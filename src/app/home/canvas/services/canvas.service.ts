import { inject, Injectable } from '@angular/core';
import { Coords2d } from '../drawing-tools/types/coords.type';
import { PointsService } from './points.service';
import { StackService } from './stack.service';
import { AnglesService } from './angles.service';
import { FigureElementsService } from './figure-elements.service';
import { LinesService } from './lines.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from 'src/app/models/api-response.model';
import { CanvasServiceInterface } from '../interfaces/canvas-service.interface';
import { environment } from 'src/environments/environment';
import { TokenService } from 'src/app/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class CanvasService implements CanvasServiceInterface {
  private hasFiguresSubject = new BehaviorSubject<boolean>(false);
  hasFigures$ = this.hasFiguresSubject.asObservable();

  private taskIdSubject = new BehaviorSubject<string | null>(null);
  taskId$ = this.taskIdSubject.asObservable();

  private api = `${environment.apiUrl}`;
  private http = inject(HttpClient);

  constructor(
    private pointsService: PointsService,
    private stackService: StackService,
    private anglesService: AnglesService,
    private figureElementsService: FigureElementsService,
    private linesService: LinesService,
    private tokenService: TokenService
  ) {
    this.stackService.pathsChanged$.subscribe(() => {
      const paths = this.stackService.getPaths();
      const hasFigures = paths.some((p) => !!p.figureName && p.path.length > 0);
      this.hasFiguresSubject.next(hasFigures);
    });
  }

  exportTaskJson(): Observable<ApiResponse<any>> {
    const taskData = this.serializeTaskJson();

    return this.sendTaskToApi(taskData);
  }

  private sendTaskToApi(data: any) {
    const token = this.tokenService.getTokenFromStorage('authToken');

    const options = token
      ? { headers: this.tokenService.createAuthHeaders(token) }
      : {};

    console.log(
      'Sending request to: ',
      this.api,
      'with data:',
      data,
      'options:',
      options
    );

    return this.http.post<ApiResponse<string>>(
      `${this.api}/api/taskprocessing/process`,
      data,
      options
    );
  }

  serializeTaskJson(): any {
    const exportData: Record<string, any> = {};

    const paths = this.stackService.getPaths();
    const angles = this.anglesService.getAllAngles();
    const elements = this.figureElementsService.getAllFigureElements();
    const points = this.pointsService.getAllPoints();
    const lines = this.linesService.getAllLines();

    for (const item of paths) {
      const figureName = item.figureName!;
      const baseName = figureName.split('_')[0];

      if (!exportData[figureName]) {
        exportData[figureName] = {
          tool: baseName,
          path: item.path,
          lines: {},
          angles: {},
          elements: {},
          points: {},
        };
      }

      const figurePoints = points
        .filter((p) => p.attachedToFigure === figureName && p.label)
        .sort((a, b) => {
          const idxA = item.path.findIndex(
            (pt) => pt.x === a.x && pt.y === a.y
          );
          const idxB = item.path.findIndex(
            (pt) => pt.x === b.x && pt.y === b.y
          );
          return idxA - idxB;
        });

      const excludeLines = new Set(
        Array.from(elements[figureName] ?? [])
          .filter((el: { label?: string }) => !!el.label)
          .map((el) => el.label!)
      );

      const allLineKeys: string[] = [];
      for (let i = 0; i < figurePoints.length; i++) {
        for (let j = i + 1; j < figurePoints.length; j++) {
          const label1 = figurePoints[i].label!;
          const label2 = figurePoints[j].label!;
          const key = [label1, label2].sort().join('');
          if (lines[key] && !excludeLines.has(key)) {
            allLineKeys.push(key);
          }
        }
      }

      const orderedLineKeys: string[] = [];
      for (let i = 0; i < figurePoints.length; i++) {
        const current = figurePoints[i].label!;
        const next = figurePoints[(i + 1) % figurePoints.length].label!;
        const key = [current, next].sort().join('');
        if (allLineKeys.includes(key)) {
          orderedLineKeys.push(key);
        }
      }
      for (const key of allLineKeys) {
        if (!orderedLineKeys.includes(key)) {
          orderedLineKeys.push(key);
        }
      }

      for (const key of orderedLineKeys) {
        exportData[figureName].lines[key] = lines[key];
      }

      if (elements[figureName]) {
        exportData[figureName].elements = Array.from(elements[figureName]).map(
          (el: { label?: string; length?: any }) => {
            if (el.label && lines[el.label] !== undefined) {
              return { ...el, length: lines[el.label] };
            }
            return el;
          }
        );
      }

      const pointLabels = new Set(figurePoints.map((p) => p.label!));

      for (const [key, angle] of Object.entries(angles)) {
        const involvedPoints = key.split('');
        if (involvedPoints.some((p) => pointLabels.has(p))) {
          exportData[figureName].angles[key] = angle;
        }
      }

      exportData[figureName].points = figurePoints;
    }

    return exportData;
  }

  public updateTaskId(id: string | null): void {
    this.taskIdSubject.next(id);
  }
}
