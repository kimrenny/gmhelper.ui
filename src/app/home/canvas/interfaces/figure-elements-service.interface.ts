export interface FigureElementsServiceInterface {
  addFigureElement(
    figureName: string,
    elementType: string,
    label?: string
  ): void;

  getAllFigureElements(): Record<string, Set<{ type: string; label?: string }>>;

  hasFigureElement(figureName: string, elementType: string): boolean;

  removeFigureElement(figureName: string, elementType: string | 'all'): void;

  clearfigureElements(figureName: string): void;

  clearAllFigureElements(): void;

  getFigureElements(
    figureName: string
  ): Set<{ type: string; label?: string }> | undefined;

  getFigureElementsTypes(figureName: string): string[];

  moveToRedo(figureName: string): void;

  restoreFromRedo(figureName: string): void;

  resetRedo(): void;
}
