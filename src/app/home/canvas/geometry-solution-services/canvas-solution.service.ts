import { inject, Injectable } from '@angular/core';
import { Coords2d } from '../drawing-tools/types/coords.type';
import { PointsSolutionService } from './points-solution.service';
import { StackSolutionService } from './stack-solution.service';
import { AnglesSolutionService } from './angles-solution.service';
import { FigureElementsSolutionService } from './figure-elements-solution.service';
import { LinesSolutionService } from './lines-solution.service';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from 'src/app/models/api-response.model';
import { LineLength } from '../drawing-tools/types/line-length.type';
import { CanvasService } from '../services/canvas.service';
import { Ellipse } from '../drawing-tools/ellipse.tool';
import { FiguresService } from '../services/figures.service';
import { CounterService } from './counter-solution.service';

@Injectable({
  providedIn: 'root',
})
export class GeoCanvasSolutionService {
  private api = 'https://localhost:7057';
  private http = inject(HttpClient);

  taskId$ = this.canvasService.taskId$;

  constructor(
    private canvasService: CanvasService,
    private pointsService: PointsSolutionService,
    private stackService: StackSolutionService,
    private anglesService: AnglesSolutionService,
    private figureElementsService: FigureElementsSolutionService,
    private figuresService: FiguresService,
    private linesService: LinesSolutionService,
    private counterService: CounterService
  ) {}

  public getTaskFromApi(id: string): Observable<boolean> {
    return this.http
      .get<ApiResponse<any>>(`${this.api}/api/taskprocessing/get/${id}`)
      .pipe(
        tap((res) => {
          if (res.success) {
            console.log('Task data:', res.data);
            this.deserializeTaskJson(res.data);
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

  deserializeTaskJson(data: any) {
    console.log('Deserialization started');
    console.log('Raw data:', data);

    this.pointsService.resetPoints();
    console.log('Points reset');

    this.stackService.clear();
    console.log('Stack cleared');

    this.linesService.clearAllLines();
    console.log('Lines cleared');

    this.anglesService.clearAllAngles();
    console.log('Angles cleared');

    this.figureElementsService.clearAllFigureElements();
    console.log('Figure elements cleared');

    for (const [figureName, figureData] of Object.entries<any>(data)) {
      console.log(`Restoring figure: ${figureName}`);
      console.log('Figure data:', figureData);

      this.stackService.pushStack(
        {
          figureName: figureName,
          path: figureData.path,
          tool: this.getToolByFigureName(figureName),
        },
        'paths'
      );
      console.log('→ Path pushed to stack:', figureData.path);

      const restoredPoints = figureData.points.map((p: any) => ({
        ...p,
        attachedToFigure: figureName,
      }));
      this.pointsService.addPoints(restoredPoints);
      console.log('→ Points added:', restoredPoints);

      for (const [key, value] of Object.entries(figureData.lines)) {
        this.linesService.setLine(key, value as LineLength);
        console.log(`→ Line restored [${key}]:`, value);
      }

      for (const [key, value] of Object.entries(figureData.angles)) {
        this.anglesService.setAngleValue(key, value as LineLength);
        console.log(`→ Angle restored [${key}]:`, value);
      }

      if (figureData.elements && Array.isArray(figureData.elements)) {
        const elementsSet = new Set<{ type: string; label?: string }>(
          figureData.elements
        );
        this.figureElementsService.setElements(figureName, elementsSet);
        console.log('→ Figure elements set:', Array.from(elementsSet));
      }
    }

    console.log('Deserialization finished');
  }

  getToolByFigureName(figureName: string): any {}
}
