import { Point } from '../drawing-tools/types/point';
import { Coords2d } from '../drawing-tools/types/coords.type';

export interface PointsServiceInterface {
  addPoint(
    x: number,
    y: number,
    attachedToFigure: string,
    attachedToPoint: number
  ): string;

  getAllPoints(): Point[];

  getPointByLabel(label: string): Point | undefined;

  getPointLabelByCoords(coords: Coords2d): string | null;

  getPointsByFigure(figureName: string, isEllipse?: boolean): Point[];

  isPointAt(label: string, point: { x: number; y: number }): boolean;

  removePoint(label: string): void;

  bindPointToFigure(point: Point, figureName: string, pointIndex: number): void;

  removeFigureElementPoints(figureName: string): void;

  resetPoints(): void;
}
