import { Injectable, Injector } from '@angular/core';
import { LineLength } from '../drawing-tools/types/line-length.type';
import { stackInfo } from '../drawing-tools/types/stack-info.type';
import { FigureElementsSolutionService } from './figure-elements-solution.service';
import { LinesSolutionService } from './lines-solution.service';
import { StackType } from '../drawing-tools/types/stack.type';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StackSolutionService {
  private paths: stackInfo[] = [];
  private redoStack: stackInfo[] = [];

  private linesService!: LinesSolutionService;

  constructor(
    private injector: Injector,
    private figureElementsService: FigureElementsSolutionService
  ) {}

  getLinesService(): LinesSolutionService {
    if (!this.linesService) {
      this.linesService = this.injector.get(LinesSolutionService);
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

          const elements = this.figureElementsService.getFigureElements(
            path.figureName
          );
          const labels = Array.from(elements ?? [])
            .filter((el) => !!el.label)
            .map((el) => el.label!);

          linesService.moveToRedo(labels);
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
          const labels = Array.from(elements ?? [])
            .filter(
              (el: { type: string; label?: string }) =>
                el.type === 'line' && el.label
            )
            .map((el) => el.label!);

          linesService.restoreFromRedo(labels);
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
          const labels = Array.from(elements ?? [])
            .filter(
              (el: { type: string; label?: string }) =>
                el.type === 'line' && el.label
            )
            .map((el) => el.label!);

          linesService.restoreFromRedo(labels);
        }

        return path;
      }

      case 'paths': {
        if (this.paths.length === 0) return undefined;

        const path = this.paths.pop();
        if (path?.figureName) {
          this.figureElementsService.moveToRedo(path.figureName);

          const elements = this.figureElementsService.getFigureElements(
            path.figureName
          );
          const labels = Array.from(elements ?? [])
            .filter(
              (el: { type: string; label?: string }) =>
                el.type === 'line' && el.label
            )
            .map((el) => el.label!);

          linesService.moveToRedo(labels);

          this.figureElementsService.removeFigureElement(
            path.figureName,
            'all'
          );
        }

        return path;
      }
    }
  }

  resetStack(stack: StackType) {
    const linesService = this.getLinesService();

    switch (stack) {
      case 'redo': {
        this.redoStack = [];
        this.figureElementsService.resetRedo();
        linesService.resetRedo();
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

  clear(): void {
    this.paths = [];
    this.redoStack = [];
  }
}
