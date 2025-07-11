import { Injectable } from '@angular/core';
import { Point } from '../drawing-tools/types/point';
import { Coords2d } from '../drawing-tools/types/coords.type';
import { StackSolutionService } from './stack-solution.service';

@Injectable({
  providedIn: 'root',
})
export class PointsSolutionService {
  private points: Point[] = [];
  private pointCounter: number = 0;

  private readonly epsilon = 0.1;

  constructor(private stackService: StackSolutionService) {}

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

  addPoints(points: Partial<Point>[]): void {
    for (const p of points) {
      this.addPoint(
        p.x!,
        p.y!,
        p.attachedToFigure ?? '',
        p.attachedToPoint ?? -1
      );
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

  getAllPoints(): Point[] {
    return this.points;
  }

  getPointByLabel(label: string): Point | undefined {
    return this.points.find((p) => p.label === label);
  }

  getPointLabelByCoords(coords: Coords2d): string | null {
    for (const point of this.points) {
      const dx = Math.abs(point.x - coords.x);
      const dy = Math.abs(point.y - coords.y);

      if (dx < this.epsilon && dy < this.epsilon) {
        return point.label;
      }
    }
    return null;
  }

  getPointsByFigure(figureName: string, isEllipse: boolean = false): Point[] {
    if (!isEllipse) {
      const matchedPoints = this.getAllPoints().filter(
        (point) => point.attachedToFigure === figureName
      );

      if (matchedPoints.length > 0) {
        return matchedPoints;
      }
    }

    const pathEntry = this.stackService
      .getPaths()
      .find((p) => p.figureName === figureName);

    if (pathEntry && pathEntry.path.length >= 2) {
      return pathEntry.path.map((p) => ({
        x: p.x,
        y: p.y,
        attachedToFigure: figureName,
        attachedToPoint: -1,
        label: '',
      }));
    }

    return [];
  }

  isPointAt(label: string, point: { x: number; y: number }): boolean {
    const existing = this.getPointByLabel(label);
    if (!existing) return false;
    return existing.x === point.x && existing.y === point.y;
  }

  removePoint(label: string): void {
    this.points = this.points.filter((p) => p.label !== label);
  }

  bindPointToFigure(
    point: Point,
    figureName: string,
    pointIndex: number
  ): void {
    point.attachedToFigure = figureName;
    point.attachedToPoint = pointIndex;
  }

  removeFigureElementPoints(figureName: string) {
    this.points = this.points.filter(
      (p) => !(p.attachedToFigure === figureName && p.attachedToPoint < 0)
    );
  }

  resetPoints(): void {
    this.points = [];
    this.pointCounter = 0;
  }
}
