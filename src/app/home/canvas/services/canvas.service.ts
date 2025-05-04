import { Injectable } from '@angular/core';
import { Point } from '../utils/point';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  private points: Point[] = [];
  private pointCounter: number = 0;

  constructor() {}

  addPoint(
    x: number,
    y: number,
    attachedToFigure: string,
    attachedToPoint: number
  ): void {
    const pointId = this.pointCounter++;
    const pointLabel = this.getPointLabel(pointId);

    const point = new Point(
      x,
      y,
      attachedToFigure,
      attachedToPoint,
      pointLabel
    );

    console.log('Added point: ', point);
    this.points.push(point);
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

  bindPointToFigure(
    point: Point,
    figureName: string,
    pointIndex: number
  ): void {
    point.attachedToFigure = figureName;
    point.attachedToPoint = pointIndex;
  }

  resetPoints(): void {
    this.points = [];
    this.pointCounter = 0;
  }
}
