import { Coords2d } from '../drawing-tools/types/coords.type';

export interface FiguresServiceInterface {
  getAllFigures(): string[];

  getFigureNameByCoords(coords: Coords2d): string | null;

  getFigureColorByName(name: string): string;

  changeFigureColor(color: string): void;

  findFigureByPoint(pos: { x: number; y: number }): {
    point1: { x: number; y: number };
    point2: { x: number; y: number };
    attachedToFigure: string;
  } | null;
}
