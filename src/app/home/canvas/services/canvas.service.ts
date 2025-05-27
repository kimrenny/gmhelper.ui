import { Injectable } from '@angular/core';
import { Point } from '../utils/point';
import { stackInfo } from '../drawing-tools/types/stack-info.type';
import { LineLength } from '../drawing-tools/types/line-length.type';
import { StackType } from '../drawing-tools/types/stack.type';
import { Coords2d } from '../drawing-tools/types/coords.type';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  private points: Point[] = [];
  private pointCounter: number = 0;
  private lines: Record<string, LineLength> = {};
  private selectedLine: { a: Coords2d; b: Coords2d } | null = null;
  private selectedFigure: { name: string } | null = null;

  private paths: stackInfo[] = [];
  private redoStack: stackInfo[] = [];

  private figureElements: Record<
    string,
    Set<{ type: string; label?: string }>
  > = {};
  private figureElementsRedo: Record<
    string,
    Set<{ type: string; label?: string }>
  > = {};
  private linesRedo: Record<string, LineLength>[] = [];

  constructor() {}

  addPoint(
    x: number,
    y: number,
    attachedToFigure: string,
    attachedToPoint: number
  ): string {
    const pointId = this.pointCounter++;

    const pointLabel = this.getPointLabel(pointId);

    const point = new Point(
      x,
      y,
      attachedToFigure,
      attachedToPoint,
      pointLabel
    );

    this.points.push(point);

    return pointLabel;
  }

  createLine(point1: string, point2: string): void {
    const lineName = point1 + point2;
    if (!(lineName in this.lines)) {
      this.lines[lineName] = null;
    }
  }

  setLineLength(point1: string, point2: string, length: LineLength): void {
    const p1 = this.getPointByLabel(point1);
    const p2 = this.getPointByLabel(point2);

    if (!p1 || !p2) return;

    const isPolygon =
      p1.attachedToFigure &&
      p1.attachedToFigure === p2.attachedToFigure &&
      p1.attachedToFigure.toLowerCase().includes('polygon');

    if (isPolygon) {
      this.setPolygonLinesLength(p1, length);
    } else {
      const lineName = point1 + point2;
      if (lineName in this.lines) {
        this.lines[lineName] = length;
      }
    }
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

  setPolygonLinesLength(point: Point, length: LineLength): void {
    const polygonPoints = this.getPointsByFigure(point.attachedToFigure);

    for (let i = 0; i < polygonPoints.length; i++) {
      for (let j = i + 1; j < polygonPoints.length; j++) {
        const labelA = polygonPoints[i].label;
        const labelB = polygonPoints[j].label;
        const lineName1 = labelA + labelB;
        const lineName2 = labelB + labelA;

        if (this.lines[lineName1] !== undefined) {
          this.lines[lineName1] = length;
        } else if (this.lines[lineName2] !== undefined) {
          this.lines[lineName2] = length;
        }
      }
    }
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

  getPaths(): stackInfo[] {
    return this.paths;
  }

  getPointsByFigure(figureName: string, isEllipse: boolean = false): Point[] {
    if (!isEllipse) {
      const matchedPoints = this.points.filter(
        (point) => point.attachedToFigure === figureName
      );

      if (matchedPoints.length > 0) {
        return matchedPoints;
      }
    }

    const pathEntry = this.paths.find((p) => p.figureName === figureName);

    if (pathEntry && pathEntry.path.length >= 2) {
      return pathEntry.path.map((p) => ({
        x: p.x,
        y: p.y,
        attachedToFigure: figureName,
        attachedToPoint: -1,
        label: '',
      }));
    }

    return [];
  }

  getAllPoints(): Point[] {
    return this.points;
  }

  getAllFigures(): string[] {
    return [
      ...new Set(
        this.paths
          .map((p) => p.figureName)
          .filter((name): name is string => typeof name === 'string')
      ),
    ];
  }

  getPointByLabel(label: string): Point | undefined {
    return this.points.find((p) => p.label === label);
  }

  getPointLabelByCoords(coords: Coords2d): string | null {
    for (const point of this.points) {
      if (point.x === coords.x && point.y === coords.y) {
        return point.label;
      }
    }
    return null;
  }

  getFigureNameByCoords(coords: Coords2d): string | null {
    for (const point of this.points) {
      if (point.x === coords.x && point.y === coords.y) {
        return point.attachedToFigure ?? null;
      }
    }

    for (const path of this.paths) {
      for (const point of path.path) {
        if (point.x === coords.x && point.y === coords.y) {
          return path.figureName ?? null;
        }
      }
    }

    console.warn('No matching point found for coords:', coords);
    return null;
  }

  getLinesByFigureName(
    figureName: string
  ): { name: string; a: Coords2d; b: Coords2d }[] {
    const figurePoints = this.points.filter(
      (p) => p.attachedToFigure === figureName
    );

    const nameToCoord = new Map<string, Coords2d>();
    for (const p of figurePoints) {
      if (p.label) {
        nameToCoord.set(p.label, { x: p.x, y: p.y });
      }
    }

    const labels = Array.from(nameToCoord.keys());

    const result: { name: string; a: Coords2d; b: Coords2d }[] = [];

    for (const lineName in this.lines) {
      const [l1, l2] = lineName.split('');

      if (labels.includes(l1) && labels.includes(l2)) {
        const a = nameToCoord.get(l1);
        const b = nameToCoord.get(l2);

        if (a && b) {
          result.push({ name: lineName, a, b });
        }
      }
    }

    return result;
  }

  getLineLength(a: string, b: string): LineLength {
    return this.lines[`${a}${b}`] ?? this.lines[`${b}${a}`];
  }

  getFigureColorByName(name: string): string {
    return (
      this.paths.find((f) => f.figureName === name)?.path?.[0].color ??
      '#000000'
    );
  }

  findLineByPoint(pos: { x: number; y: number }): {
    point1: { x: number; y: number };
    point2: { x: number; y: number };
    attachedToFigure: string;
  } | null {
    const clickTolerance = 5;

    for (const lineName of Object.keys(this.lines)) {
      const label1 = lineName[0];
      const label2 = lineName[1];

      const point1 = this.getPointByLabel(label1);
      const point2 = this.getPointByLabel(label2);

      if (!point1 || !point2) {
        console.warn(
          `[findLineByPoint] point(s) not found for labels: ${label1}, ${label2}`
        );
        continue;
      }

      const near = this.isPointNearLine(
        pos,
        { x: point1.x, y: point1.y },
        { x: point2.x, y: point2.y },
        clickTolerance
      );

      if (near) {
        return {
          point1: { x: point1.x, y: point1.y },
          point2: { x: point2.x, y: point2.y },
          attachedToFigure:
            point1.attachedToFigure || point2.attachedToFigure || '',
        };
      }
    }

    return null;
  }

  findFigureByPoint(pos: { x: number; y: number }): {
    point1: { x: number; y: number };
    point2: { x: number; y: number };
    attachedToFigure: string;
  } | null {
    const figures = this.getAllFigures();

    for (const figure of figures) {
      if (figure.split('_')[0].toLowerCase() === 'ellipse') {
        let points = this.getPointsByFigure(figure, true);

        if (!points || points.length < 2) {
          const pathEntry = this.paths.find((p) => p.figureName === figure);
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

  removeFigureElementPoints(figureName: string) {
    this.points = this.points.filter(
      (p) => !(p.attachedToFigure === figureName && p.attachedToPoint < 0)
    );
  }

  clearfigureElements(figureName: string): void {
    delete this.figureElements[figureName];
  }

  clearAllFigureElements(): void {
    this.figureElements = {};
  }

  getFigureElements(figureName: string): string[] {
    if (!this.figureElements[figureName]) return [];
    return Array.from(this.figureElements[figureName]).map((el) => el.type);
  }

  private isPointNearLine(
    p: { x: number; y: number },
    a: { x: number; y: number },
    b: { x: number; y: number },
    tolerance: number
  ): boolean {
    const A = p.x - a.x;
    const B = p.y - a.y;
    const C = b.x - a.x;
    const D = b.y - a.y;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;

    if (len_sq !== 0) param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
      xx = a.x;
      yy = a.y;
    } else if (param > 1) {
      xx = b.x;
      yy = b.y;
    } else {
      xx = a.x + param * C;
      yy = a.y + param * D;
    }

    const dx = p.x - xx;
    const dy = p.y - yy;

    return Math.sqrt(dx * dx + dy * dy) <= tolerance;
  }

  bindPointToFigure(
    point: Point,
    figureName: string,
    pointIndex: number
  ): void {
    point.attachedToFigure = figureName;
    point.attachedToPoint = pointIndex;
  }

  pushStack(path: stackInfo | null, stack: StackType) {
    if (!path) return;

    switch (stack) {
      case 'redo': {
        this.redoStack.push(path);

        if (path.figureName) {
          if (this.figureElements[path.figureName]) {
            this.figureElementsRedo[path.figureName] =
              this.figureElements[path.figureName];
            delete this.figureElements[path.figureName];
          }

          if (this.lines[path.figureName]) {
            this.linesRedo.push({
              [path.figureName]: this.lines[path.figureName],
            });
            delete this.lines[path.figureName];
          }
        }
        return;
      }
      case 'paths': {
        this.paths.push(path);

        if (path.figureName) {
          if (this.figureElementsRedo[path.figureName]) {
            this.figureElements[path.figureName] =
              this.figureElementsRedo[path.figureName];
            delete this.figureElementsRedo[path.figureName];
          }

          const lineIndex = this.linesRedo.findIndex(
            (lineObj) => Object.keys(lineObj)[0] === path.figureName
          );
          if (lineIndex !== -1) {
            this.lines[path.figureName] =
              this.linesRedo[lineIndex][path.figureName];
            this.linesRedo.splice(lineIndex, 1);
          }
        }
        break;
      }
    }
  }

  popStack(stack: StackType): stackInfo | undefined {
    switch (stack) {
      case 'redo': {
        if (this.redoStack.length === 0) return undefined;

        const path = this.redoStack.pop();

        if (path?.figureName) {
          if (this.figureElementsRedo[path.figureName]) {
            this.figureElements[path.figureName] =
              this.figureElementsRedo[path.figureName];
            delete this.figureElementsRedo[path.figureName];
          }

          const lineIndex = this.linesRedo.findIndex(
            (lineObj) => Object.keys(lineObj)[0] === path.figureName
          );
          if (lineIndex !== -1) {
            this.lines[path.figureName] =
              this.linesRedo[lineIndex][path.figureName];
            this.linesRedo.splice(lineIndex, 1);
          }
        }

        return path;
      }

      case 'paths': {
        if (this.paths.length === 0) return undefined;

        const path = this.paths.pop();

        if (path?.figureName) {
          if (this.figureElements[path.figureName]) {
            this.figureElementsRedo[path.figureName] =
              this.figureElements[path.figureName];
            delete this.figureElements[path.figureName];
          }

          if (this.lines[path.figureName]) {
            this.linesRedo.push({
              [path.figureName]: this.lines[path.figureName],
            });
            delete this.lines[path.figureName];
          }

          this.removeFigureElement(path.figureName, 'all');
        }

        return path;
      }
    }
  }

  resetStack(stack: StackType) {
    switch (stack) {
      case 'redo': {
        this.redoStack = [];
        this.figureElementsRedo = {};
        this.linesRedo = [];
        break;
      }
      case 'paths': {
        this.paths = [];
        this.figureElements = {};
        this.lines = {};
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

  get isFigureSelected(): boolean {
    return !!this.selectedFigure?.name;
  }

  changeFigureColor(color: string): void {
    if (!this.selectedFigure?.name) return;

    const figure = this.paths.find(
      (p) => p.figureName === this.selectedFigure!.name
    );
    if (!figure) return;

    for (const point of figure.path) {
      point.color = color;
    }
  }

  resetPoints(): void {
    this.points = [];
    this.pointCounter = 0;
  }
}
