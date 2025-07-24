import { Injectable } from '@angular/core';
import { StackService } from './stack.service';
import { PointsService } from './points.service';
import { Coords2d } from '../../drawing-tools/types/coords.type';
import { SelectionService } from './selection.service';
import { FiguresServiceInterface } from '../../interfaces/figures-service.interface';

@Injectable({
  providedIn: 'root',
})
export class FiguresService implements FiguresServiceInterface {
  constructor(
    private stackService: StackService,
    private pointsService: PointsService,
    private selectionService: SelectionService
  ) {}

  getAllFigures(): string[] {
    const paths = this.stackService.getPaths();
    return [
      ...new Set(
        paths
          .map((p) => p.figureName)
          .filter((name): name is string => typeof name === 'string')
      ),
    ];
  }

  getFigureNameByCoords(coords: Coords2d): string | null {
    for (const point of this.pointsService.getAllPoints()) {
      if (point.x === coords.x && point.y === coords.y) {
        return point.attachedToFigure ?? null;
      }
    }

    const paths = this.stackService.getPaths();
    for (const path of paths) {
      for (const point of path.path) {
        if (point.x === coords.x && point.y === coords.y) {
          return path.figureName ?? null;
        }
      }
    }

    console.warn('No matching point found for coords:', coords);
    return null;
  }

  getFigureColorByName(name: string): string {
    const paths = this.stackService.getPaths();
    return (
      paths.find((f) => f.figureName === name)?.path?.[0].color ?? '#000000'
    );
  }

  changeFigureColor(color: string): void {
    const selectedFigure = this.selectionService.getSelectedFigure();
    if (!selectedFigure?.name) return;

    const paths = this.stackService.getPaths();
    const figure = paths.find((p) => p.figureName === selectedFigure!.name);
    if (!figure) return;

    for (const point of figure.path) {
      point.color = color;
    }
  }

  findFigureByPoint(pos: { x: number; y: number }): {
    point1: { x: number; y: number };
    point2: { x: number; y: number };
    attachedToFigure: string;
  } | null {
    const figures = this.getAllFigures();
    const paths = this.stackService.getPaths();

    for (const figure of figures) {
      if (figure.split('_')[0].toLowerCase() === 'ellipse') {
        let points = this.pointsService.getPointsByFigure(figure, true);

        if (!points || points.length < 2) {
          const pathEntry = paths.find((p) => p.figureName === figure);
          if (!pathEntry || pathEntry.path.length < 2) {
            continue;
          }

          points = pathEntry.path.map((p) => ({
            x: p.x,
            y: p.y,
            attachedToFigure: figure,
            attachedToPoint: -1,
            label: '',
          }));
        }

        const startX = points[0].x;
        const startY = points[0].y;
        const endX = points[1].x;
        const endY = points[1].y;

        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;
        const radiusX = Math.abs(endX - startX) / 2;
        const radiusY = Math.abs(endY - startY) / 2;

        const dx = pos.x - centerX;
        const dy = pos.y - centerY;

        const value =
          (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY);
        const threshold = 0.1;
        const isOnEllipse = Math.abs(value - 1) <= threshold;

        if (isOnEllipse) {
          return {
            point1: { x: points[0].x, y: points[0].y },
            point2: { x: points[1].x, y: points[1].y },
            attachedToFigure: figure,
          };
        }
      }
    }

    return null;
  }
}
