import { BehaviorSubject, Observable } from 'rxjs';

export interface CanvasServiceInterface {
  hasFigures$?: BehaviorSubject<boolean> | Observable<boolean>;
  taskId$?: BehaviorSubject<string | null> | Observable<string | null>;

  exportTaskJson?(): void;

  serializeTaskJson?(): any;

  getTaskFromApi?(id: string): Observable<boolean>;

  deserializeTaskJson?(data: any): void;

  getToolByFigureName?(figureName: string, figureData: any): any;
}
