import { Coords2d } from '../drawing-tools/types/coords.type';

export interface SelectionServiceInterface {
  setSelectedLine(a: Coords2d, b: Coords2d): void;
  getSelectedLine(): { a: Coords2d; b: Coords2d } | null;
  resetSelectedLine(): void;
  readonly isLineSelected: boolean;

  setSelectedFigure(name: string | null): void;
  getSelectedFigure(): { name: string } | null;
  readonly isFigureSelected: boolean;
}
