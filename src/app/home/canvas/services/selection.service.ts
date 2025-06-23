import { Injectable } from '@angular/core';
import { Coords2d } from '../drawing-tools/types/coords.type';

@Injectable({
  providedIn: 'root',
})
export class SelectionService {
  private selectedLine: { a: Coords2d; b: Coords2d } | null = null;
  private selectedFigure: { name: string } | null = null;

  setSelectedLine(a: Coords2d, b: Coords2d) {
    this.selectedLine = { a, b };
  }

  getSelectedLine(): { a: Coords2d; b: Coords2d } | null {
    return this.selectedLine;
  }

  resetSelectedLine() {
    this.selectedLine = null;
  }

  get isLineSelected(): boolean {
    return !!this.selectedLine;
  }

  setSelectedFigure(name: string | null) {
    this.selectedFigure = name ? { name: name } : null;
  }

  getSelectedFigure(): { name: string } | null {
    return this.selectedFigure;
  }

  get isFigureSelected(): boolean {
    return !!this.selectedFigure?.name;
  }
}
