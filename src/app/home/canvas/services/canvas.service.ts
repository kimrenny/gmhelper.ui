import { Injectable } from '@angular/core';
import { Point } from '../utils/point';
import { stackInfo } from '../drawing-tools/types/stack-info.type';
import { LineLength } from '../drawing-tools/types/line-length.type';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  private points: Point[] = [];
  private pointCounter: number = 0;
  private lines: Record<string, LineLength> = {};

  private undoStack: stackInfo[] = [];
  private redoStack: stackInfo[] = [];

  constructor() {}

  addPoint(
    x: number,
    y: number,
    attachedToFigure: string,
    attachedToPoint: number
  ): string {
    const pointId = this.pointCounter++;
    const pointLabel = this.getPointLabel(pointId);

    const point = new Point(
      x,
      y,
      attachedToFigure,
      attachedToPoint,
      pointLabel
    );

    this.points.push(point);

    return pointLabel;
  }

  createLine(point1: string, point2: string): void {
    const lineName = point1 + point2;
    if (!(lineName in this.lines)) {
      this.lines[lineName] = null;
      console.log(`Created line ${lineName}: null`);
    }
  }

  setLineLength(point1: string, point2: string, length: LineLength): void {
    const lineName = point1 + point2;
    if (lineName in this.lines) {
      this.lines[lineName] = length;
      console.log(`Updated line ${lineName}: ${length}`);
    } else {
      console.warn(`Line ${lineName} does not exist.`);
    }
  }

  private getPointLabel(index: number): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let label = '';
    let i = index;
    while (i >= alphabet.length) {
      label = alphabet[i % alphabet.length] + label;
      i = Math.floor(i / alphabet.length) - 1;
    }
    label = alphabet[i] + label;
    return label;
  }

  getPointsByFigure(figureName: string): Point[] {
    return this.points.filter((point) => point.attachedToFigure === figureName);
  }

  getAllPoints(): Point[] {
    return this.points;
  }

  getPointByLabel(label: string): Point | undefined {
    return this.points.find((p) => p.label === label);
  }

  findLineByPoint(pos: { x: number; y: number }): {
    point1: { x: number; y: number };
    point2: { x: number; y: number };
    attachedToFigure: string;
  } | null {
    const clickTolerance = 5;

    for (const lineName of Object.keys(this.lines)) {
      const label1 = lineName[0];
      const label2 = lineName[1];

      const point1 = this.getPointByLabel(label1);
      const point2 = this.getPointByLabel(label2);

      if (!point1 || !point2) continue;

      if (
        this.isPointNearLine(
          pos,
          { x: point1.x, y: point1.y },
          { x: point2.x, y: point2.y },
          clickTolerance
        )
      ) {
        return {
          point1: { x: point1.x, y: point1.y },
          point2: { x: point2.x, y: point2.y },
          attachedToFigure:
            point1.attachedToFigure || point2.attachedToFigure || '',
        };
      }
    }

    return null;
  }

  private isPointNearLine(
    p: { x: number; y: number },
    a: { x: number; y: number },
    b: { x: number; y: number },
    tolerance: number
  ): boolean {
    const A = p.x - a.x;
    const B = p.y - a.y;
    const C = b.x - a.x;
    const D = b.y - a.y;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;

    if (len_sq !== 0) param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
      xx = a.x;
      yy = a.y;
    } else if (param > 1) {
      xx = b.x;
      yy = b.y;
    } else {
      xx = a.x + param * C;
      yy = a.y + param * D;
    }

    const dx = p.x - xx;
    const dy = p.y - yy;

    return Math.sqrt(dx * dx + dy * dy) <= tolerance;
  }

  bindPointToFigure(
    point: Point,
    figureName: string,
    pointIndex: number
  ): void {
    point.attachedToFigure = figureName;
    point.attachedToPoint = pointIndex;
  }

  pushStack(path: stackInfo | null, isUndo: boolean) {
    if (path) {
      if (isUndo) {
        this.undoStack.push(path);
        return;
      }
      this.redoStack.push(path);
    }
  }

  popStack(isUndo: boolean): stackInfo | undefined {
    if (isUndo) {
      if (this.undoStack.length > 0) {
        return this.undoStack.pop();
      }
    }
    if (!isUndo) {
      if (this.redoStack.length > 0) {
        return this.redoStack.pop();
      }
    }

    return undefined;
  }

  resetStack(param: 'undo' | 'redo') {
    if (param === 'undo') {
      this.undoStack = [];
      return;
    }
    this.redoStack = [];
    return;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  resetPoints(): void {
    this.points = [];
    this.pointCounter = 0;
  }
}
