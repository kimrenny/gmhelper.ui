import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  private componentVisibilitySubject = new BehaviorSubject<boolean>(false);
  public componentVisibility$ = this.componentVisibilitySubject.asObservable();

  private currentShape: string | null = null;
  private currentDimensions: number[] = [];
  private currentTask: string | null = null;
  private currentDimensionsPx: number[] = [];

  private drawingResponseAllowedSubject = new BehaviorSubject<boolean>(false);
  public drawingResponseAllowed$ =
    this.drawingResponseAllowedSubject.asObservable();

  setComponentVisibility(isVisible: boolean) {
    this.componentVisibilitySubject.next(isVisible);
  }

  getComponentVisibility(): boolean {
    return this.componentVisibilitySubject.value;
  }

  setShape(
    shape: string | null,
    dimensions: number[],
    task: string | null,
    dimensionsPx: number[]
  ) {
    this.currentShape = shape;
    this.currentDimensions = dimensions;
    this.currentTask = task;
    this.currentDimensionsPx = dimensionsPx;
  }

  getShapeDetails(): {
    shape: string | null;
    dimensions: number[];
    task: string | null;
    dimensionsPx: number[];
  } {
    return {
      shape: this.currentShape,
      dimensions: this.currentDimensions,
      task: this.currentTask,
      dimensionsPx: this.currentDimensionsPx,
    };
  }

  setDrawingResponseAllowed(isAllowed: boolean) {
    this.drawingResponseAllowedSubject.next(isAllowed);
  }

  clearShape() {
    this.currentShape = null;
    this.currentDimensions = [];
    this.currentTask = null;
    this.currentDimensionsPx = [];
  }
}
