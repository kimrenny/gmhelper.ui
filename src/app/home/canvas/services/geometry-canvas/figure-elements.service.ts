import { Injectable } from '@angular/core';
import { FigureElementsServiceInterface } from '../../interfaces/figure-elements-service.interface';

@Injectable({
  providedIn: 'root',
})
export class FigureElementsService implements FigureElementsServiceInterface {
  private figureElements: Record<
    string,
    Set<{ type: string; label?: string }>
  > = {};
  private figureElementsRedo: Record<
    string,
    Set<{ type: string; label?: string }>
  > = {};

  addFigureElement(
    figureName: string,
    elementType: string,
    label?: string
  ): void {
    if (!this.figureElements[figureName]) {
      this.figureElements[figureName] = new Set();
    }
    const exists = Array.from(this.figureElements[figureName]).some(
      (el) => el.type === elementType && el.label === label
    );
    if (!exists) {
      this.figureElements[figureName].add({ type: elementType, label });
    }
  }

  getAllFigureElements(): Record<
    string,
    Set<{ type: string; label?: string }>
  > {
    return this.figureElements;
  }

  hasFigureElement(figureName: string, elementType: string): boolean {
    if (!this.figureElements[figureName]) return false;
    for (const el of this.figureElements[figureName]) {
      if (el.type === elementType) return true;
    }
    return false;
  }

  removeFigureElement(figureName: string, elementType: string | 'all'): void {
    if (elementType === 'all') {
      delete this.figureElements[figureName];
      return;
    }
    if (!this.figureElements[figureName]) return;

    this.figureElements[figureName] = new Set(
      Array.from(this.figureElements[figureName]).filter(
        (el) => el.type !== elementType
      )
    );

    if (this.figureElements[figureName].size === 0) {
      delete this.figureElements[figureName];
    }
  }

  clearfigureElements(figureName: string): void {
    delete this.figureElements[figureName];
  }

  clearAllFigureElements(): void {
    this.figureElements = {};
  }

  getFigureElements(
    figureName: string
  ): Set<{ type: string; label?: string }> | undefined {
    return this.figureElements[figureName];
  }

  getFigureElementsTypes(figureName: string): string[] {
    if (!this.figureElements[figureName]) return [];
    return Array.from(this.figureElements[figureName]).map((el) => el.type);
  }

  moveToRedo(figureName: string): void {
    const original = this.figureElements[figureName];
    if (original) {
      this.figureElementsRedo[figureName] = new Set(
        Array.from(original).map((el) => ({ ...el }))
      );
      delete this.figureElements[figureName];
    }
  }

  restoreFromRedo(figureName: string): void {
    const redo = this.figureElementsRedo[figureName];
    if (redo) {
      this.figureElements[figureName] = redo;
      delete this.figureElementsRedo[figureName];
    }
  }

  resetRedo(): void {
    this.figureElementsRedo = {};
  }
}
