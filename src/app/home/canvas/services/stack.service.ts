import { Injectable, Injector } from '@angular/core';
import { LineLength } from '../drawing-tools/types/line-length.type';
import { stackInfo } from '../drawing-tools/types/stack-info.type';
import { FigureElementsService } from './figure-elements.service';
import { LinesService } from './lines.service';
import { StackType } from '../drawing-tools/types/stack.type';

@Injectable({
  providedIn: 'root',
})
export class StackService {
  private paths: stackInfo[] = [];
  private redoStack: stackInfo[] = [];
  private linesRedo: Record<string, LineLength>[] = [];

  private linesService!: LinesService;

  constructor(
    private injector: Injector,
    private figureElementsService: FigureElementsService
  ) {}

  getLinesService(): LinesService {
    if (!this.linesService) {
      this.linesService = this.injector.get(LinesService);
    }
    return this.linesService;
  }

  getPaths(): stackInfo[] {
    return this.paths;
  }

  pushStack(path: stackInfo | null, stack: StackType) {
    if (!path) return;

    const linesService = this.getLinesService();

    switch (stack) {
      case 'redo': {
        this.redoStack.push(path);

        if (path.figureName) {
          this.figureElementsService.moveToRedo(path.figureName);

          const linesToRedo: Record<string, LineLength> = {};
          const elements = this.figureElementsService.getFigureElements(
            path.figureName
          );
          elements?.forEach((el) => {
            if (
              el.type === 'line' &&
              el.label &&
              linesService.hasLine(el.label)
            ) {
              linesToRedo[el.label] = linesService.getLineLength(
                el.label[0],
                el.label[1]
              );
              linesService.deleteLine(el.label);
            }
          });

          if (Object.keys(linesToRedo).length > 0) {
            this.linesRedo.push(linesToRedo);
          }
        }
        return;
      }

      case 'paths': {
        this.paths.push(path);

        if (path.figureName) {
          this.figureElementsService.restoreFromRedo(path.figureName);

          const elements = this.figureElementsService.getFigureElements(
            path.figureName
          );
          if (!elements) break;

          const index = this.linesRedo.findIndex((obj) =>
            Object.keys(obj).some((label) =>
              Array.from(elements).some(
                (e) => e.type === 'line' && e.label === label
              )
            )
          );

          if (index !== -1) {
            Object.entries(this.linesRedo[index]).forEach(([label, value]) => {
              linesService.setLine(label, value);
            });
            this.linesRedo.splice(index, 1);
          }
        }
        break;
      }
    }
  }

  popStack(stack: StackType): stackInfo | undefined {
    const linesService = this.getLinesService();

    switch (stack) {
      case 'redo': {
        if (this.redoStack.length === 0) return undefined;

        const path = this.redoStack.pop();
        if (path?.figureName) {
          this.figureElementsService.restoreFromRedo(path.figureName);

          const elements = this.figureElementsService.getFigureElements(
            path.figureName
          );
          if (!elements) break;

          const index = this.linesRedo.findIndex((obj) =>
            Object.keys(obj).some((label) =>
              Array.from(elements).some(
                (e) => e.type === 'line' && e.label === label
              )
            )
          );

          if (index !== -1) {
            Object.entries(this.linesRedo[index]).forEach(([label, value]) => {
              linesService.setLine(label, value);
            });
            this.linesRedo.splice(index, 1);
          }
        }

        return path;
      }

      case 'paths': {
        if (this.paths.length === 0) return undefined;

        const path = this.paths.pop();
        if (path?.figureName) {
          this.figureElementsService.moveToRedo(path.figureName);

          const linesToRedo: Record<string, LineLength> = {};
          const elements = this.figureElementsService.getFigureElements(
            path.figureName
          );
          elements?.forEach((el) => {
            if (
              el.type === 'line' &&
              el.label &&
              linesService.hasLine(el.label)
            ) {
              linesToRedo[el.label] = linesService.getLineLength(
                el.label[0],
                el.label[1]
              );
              linesService.deleteLine(el.label);
            }
          });

          if (Object.keys(linesToRedo).length > 0) {
            this.linesRedo.push(linesToRedo);
          }

          this.figureElementsService.removeFigureElement(
            path.figureName,
            'all'
          );
        }

        return path;
      }
    }

    return undefined;
  }

  resetStack(stack: StackType) {
    const linesService = this.getLinesService();

    switch (stack) {
      case 'redo': {
        this.redoStack = [];
        this.figureElementsService.resetRedo();
        this.linesRedo = [];
        break;
      }
      case 'paths': {
        this.paths = [];
        this.figureElementsService.clearAllFigureElements();
        linesService.clearAllLines();
        break;
      }
    }
  }

  get canUndo(): boolean {
    return this.paths.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  updateFigurePath(
    name: string,
    newPath: { x: number; y: number; color: string }[]
  ): void {
    const figure = this.paths.find((p) => p.figureName === name);
    if (figure) {
      figure.path = newPath;
    }
  }
}
