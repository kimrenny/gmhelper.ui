import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { clearPreviewCanvas } from '../tools/clear-preview';
import { toTransparentColor } from '../utils/preview-color';
import { drawLabel } from '../tools/draw-point-label';
import {
  restoreLineLengthToService,
  setLineLengthToService,
} from '../utils/line-length.utils';
import { CanvasServiceInterface } from '../interfaces/canvas-service.interface';
import { PointsServiceInterface } from '../interfaces/points-service.interface';
import { LinesServiceInterface } from '../interfaces/lines-service.interface';
import { AnglesServiceInterface } from '../interfaces/angles-service.interface';
import { FigureElementsServiceInterface } from '../interfaces/figure-elements-service.interface';
import { StackServiceInterface } from '../interfaces/stack-service.interface';
import { FiguresServiceInterface } from '../interfaces/figures-service.interface';
import { CounterServiceInterface } from '../interfaces/counter-service.interface';
import { LineLength } from './types/line-length.type';

export class Rectangle implements DrawingTool {
  private start: { x: number; y: number; color: string } | null = null;
  private end: { x: number; y: number; color: string } | null = null;
  private isDrawing: boolean = false;

  constructor(
    private canvasService: CanvasServiceInterface,
    private pointsService: PointsServiceInterface,
    private linesService: LinesServiceInterface,
    private anglesService: AnglesServiceInterface,
    private figureElementsService: FigureElementsServiceInterface,
    private stackService: StackServiceInterface,
    private figuresService: FiguresServiceInterface,
    private counterService: CounterServiceInterface
  ) {}

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[],
    color: string,
    redraw: boolean = false
  ): void {
    if (path.length !== 4) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = color;
    for (const point of path) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    if (redraw) {
      const figureName = this.figuresService.getFigureNameByCoords({
        x: path[0].x,
        y: path[0].y,
      });

      if (!figureName) return;

      const [label1, label2, label3, label4] = this.addPointsToCanvasService(
        ctx,
        figureName,
        path
      );
      this.linesService.createLine(label1, label2);
      this.linesService.createLine(label2, label3);
      this.linesService.createLine(label3, label4);
      this.linesService.createLine(label1, label4);

      const lines = [
        { p1: path[0], p2: path[1], labelA: label1, labelB: label2 },
        { p1: path[1], p2: path[2], labelA: label2, labelB: label3 },
        { p1: path[2], p2: path[3], labelA: label3, labelB: label4 },
        { p1: path[3], p2: path[0], labelA: label4, labelB: label1 },
      ];
      this.drawLinesLength(ctx, lines);

      this.drawLinesFromFigureData(ctx, path, figureName, false, true);
    }
  }

  private drawLinesFromFigureData(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[],
    figureName: string,
    isPreview: boolean = false,
    isRedraw: boolean = false
  ): void {
    const elements = this.figureElementsService.getFigureElements(figureName);

    const hasDiagonal = this.figureElementsService.hasFigureElement(
      figureName,
      'diagonal'
    );

    const color = path[0].color ?? '#000';
    const paths = path.map((p) => ({
      x: p.x,
      y: p.y,
    }));

    if (hasDiagonal) {
      this.drawDiagonal(ctx, paths, color, figureName, isPreview, isRedraw);
    }
  }

  drawLinesLength(
    ctx: CanvasRenderingContext2D,
    lines: {
      p1: { x: number; y: number };
      p2: { x: number; y: number };
      labelA: string;
      labelB: string;
    }[],
    length?: LineLength
  ): void {
    const centers = lines.map((line, i) => {
      return {
        index: i,
        midX: (line.p1.x + line.p2.x) / 2,
        midY: (line.p1.y + line.p2.y) / 2,
      };
    });

    const topLine = centers.reduce((min, cur) =>
      cur.midY < min.midY ? cur : min
    );
    const bottomLine = centers.reduce((max, cur) =>
      cur.midY > max.midY ? cur : max
    );
    const leftLine = centers.reduce((min, cur) =>
      cur.midX < min.midX ? cur : min
    );
    const rightLine = centers.reduce((max, cur) =>
      cur.midX > max.midX ? cur : max
    );

    for (let i = 0; i < lines.length; i++) {
      let offsetX = 0;
      let offsetY = -15;

      if (i === topLine.index) {
        offsetX = 0;
        offsetY = -15;
      } else if (i === bottomLine.index) {
        offsetX = 0;
        offsetY = 20;
      } else if (i === leftLine.index) {
        offsetX = -15;
        offsetY = 0;
      } else if (i === rightLine.index) {
        offsetX = 15;
        offsetY = 0;
      }

      const { labelA, labelB } = lines[i];

      if (length !== undefined) {
        setLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          labelA,
          labelB,
          length,
          offsetX,
          offsetY
        );
      } else {
        restoreLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          labelA,
          labelB,
          offsetX,
          offsetY
        );
      }
    }
  }

  onMouseDown(pos: { x: number; y: number }, data: ToolContext): void {
    this.start = { x: pos.x, y: pos.y, color: data.selectedColor };
    this.end = null;
    this.isDrawing = true;
  }

  onMouseMove(pos: { x: number; y: number }, data: ToolContext): void {
    if (!this.isDrawing || !this.start) return;

    this.end = { x: pos.x, y: pos.y, color: data.selectedColor };
    this.renderPreview(data);
  }

  onMouseUp(pos: { x: number; y: number }, data: ToolContext): any {
    if (!this.isDrawing || !this.start) return;

    const dx = Math.abs(pos.x - this.start.x);
    const dy = Math.abs(pos.y - this.start.y);

    if (dx <= 25 || dy <= 25) {
      this.isDrawing = false;
      this.start = null;
      this.end = null;

      clearPreviewCanvas(data);

      return;
    }

    this.end = { x: pos.x, y: pos.y, color: data.selectedColor };
    const path = this.calculateRectPath(
      this.start,
      this.end,
      data.selectedColor
    );
    const ctx = data.canvas?.getContext('2d');

    let figureName = '';

    if (ctx) {
      this.draw(ctx, path, data.selectedColor);

      figureName = this.counterService.getNextFigureName('Rectangle');
      if (!figureName) return;

      const [label1, label2, label3, label4] = this.addPointsToCanvasService(
        ctx,
        figureName,
        path
      );
      this.linesService.createLine(label1, label2);
      this.linesService.createLine(label2, label3);
      this.linesService.createLine(label3, label4);
      this.linesService.createLine(label1, label4);

      this.drawLinesLength(
        ctx,
        [
          { p1: path[0], p2: path[1], labelA: label1, labelB: label2 },
          { p1: path[1], p2: path[2], labelA: label2, labelB: label3 },
          { p1: path[2], p2: path[3], labelA: label3, labelB: label4 },
          { p1: path[3], p2: path[0], labelA: label4, labelB: label1 },
        ],
        '?'
      );
    }

    this.start = null;
    this.end = null;
    this.isDrawing = false;
    clearPreviewCanvas(data);

    return { tool: this, path, figureName: figureName };
  }

  onMouseLeave(data: ToolContext): any {
    if (!this.isDrawing) return;

    this.start = null;
    this.end = null;
    this.isDrawing = false;

    if (data.previewCanvas) {
      const previewCtx = data.previewCanvas.getContext('2d');
      previewCtx?.clearRect(
        0,
        0,
        data.previewCanvas.width,
        data.previewCanvas.height
      );
    }
  }

  onSelectFigure(
    path: { x: number; y: number }[],
    previewCanvas: HTMLCanvasElement
  ): void {
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const figureName = this.figuresService.getFigureNameByCoords(path[0]);

    if (!figureName) {
      console.warn('[onSelectFigure] no figure name found for coords.');
      return;
    }

    const drawPath = path.slice(0, 4);

    if (drawPath.length === 4) {
      const color = '#ffcc00';

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < drawPath.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = color;
      for (const point of path) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      this.drawLinesFromFigureData(
        ctx,
        path.map((p) => ({ ...p, color: color })),
        figureName,
        true
      );
    }
  }

  handleAction(action: string, data: ToolContext, figureName: string): void {
    const ctx = data.canvas?.getContext('2d');
    if (!ctx) return;

    const fullPath = this.pointsService
      .getPointsByFigure(figureName)
      .map((p) => ({ x: p.x, y: p.y }));

    const path = fullPath.slice(0, 4);

    const color = this.figuresService.getFigureColorByName(figureName);

    switch (action) {
      case 'drawDiagonal': {
        this.drawDiagonal(ctx, path, color, figureName);
        break;
      }
      case 'makeSquare': {
        this.makeSquare(ctx, path, color, figureName);
        break;
      }
      case 'rotate': {
        this.rotate(ctx, path, color, figureName);
        break;
      }
    }
  }

  drawDiagonal(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string,
    isPreview: boolean = false,
    isRedraw: boolean = false
  ): void {
    if (path.length > 4) {
      path = path.slice(0, 4);
    }
    if (path.length < 4) {
      console.warn('[drawDiagonal] path length < 4');
      return;
    }

    const existingElements =
      this.figureElementsService.getFigureElements(figureName);
    const existingDiagonals = existingElements
      ? Array.from(existingElements)
          .filter(
            (e: { type: string; label?: string }) => e.type === 'diagonal'
          )
          .map((e) => e.label)
      : [];

    const diagonalsToCheck: [(typeof path)[0], (typeof path)[0]][] = [
      [path[0], path[2]],
      [path[1], path[3]],
    ];

    if (isPreview) {
      for (const [p1, p2] of diagonalsToCheck) {
        const label1 = this.pointsService.getPointLabelByCoords(p1);
        const label2 = this.pointsService.getPointLabelByCoords(p2);
        const line = label1 && label2 ? `${label1}${label2}` : null;
        if (line && existingDiagonals.includes(line)) {
          ctx.strokeStyle = '#ffcc00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
      return;
    }

    for (const [p1, p2] of diagonalsToCheck) {
      let label1 = this.pointsService.getPointLabelByCoords(p1);
      let label2 = this.pointsService.getPointLabelByCoords(p2);
      const line = label1 && label2 ? `${label1}${label2}` : null;
      const alreadyExists = line && existingDiagonals.includes(line);

      if (alreadyExists) {
        if (!(label1 && label2)) continue;

        ctx.strokeStyle = color ?? '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        restoreLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          label1,
          label2,
          0,
          -15
        );

        continue;
      }

      if (isRedraw) continue;

      if (!(label1 && label2)) continue;

      const newLine = `${label1}${label2}`;

      ctx.strokeStyle = color ?? '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      if (!this.linesService.hasLine(newLine)) {
        this.linesService.createLine(label1, label2);
        setLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          label1,
          label2,
          '?'
        );
      }

      this.figureElementsService.addFigureElement(
        figureName,
        'diagonal',
        newLine
      );

      return;
    }
  }

  makeSquare(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string
  ): void {
    if (path.length > 4) {
      path = path.slice(0, 4);
    }
    if (path.length < 4) {
      console.warn('[makeSquare] path length < 4');
      return;
    }

    const [A, B, C, D] = path;

    const dist = (p1: { x: number; y: number }, p2: { x: number; y: number }) =>
      Math.hypot(p1.x - p2.x, p1.y - p2.y);

    const AB = dist(A, B);
    const BC = dist(B, C);

    const side = Math.min(AB, BC);

    let newPath: { x: number; y: number; color: string }[];

    if (AB <= BC) {
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const len = Math.hypot(dx, dy);
      const ux = dx / len;
      const uy = dy / len;

      const px = -uy;
      const py = ux;

      const Cx = B.x + px * side;
      const Cy = B.y + py * side;

      const Dx = A.x + px * side;
      const Dy = A.y + py * side;

      newPath = [
        { x: A.x, y: A.y, color },
        { x: B.x, y: B.y, color },
        { x: Cx, y: Cy, color },
        { x: Dx, y: Dy, color },
      ];
    } else {
      const dx = C.x - B.x;
      const dy = C.y - B.y;
      const len = Math.hypot(dx, dy);
      const ux = dx / len;
      const uy = dy / len;

      const px = -uy;
      const py = ux;

      const Dx = C.x + px * side;
      const Dy = C.y + py * side;

      const Ax = B.x + px * side;
      const Ay = B.y + py * side;

      newPath = [
        { x: Ax, y: Ay, color },
        { x: B.x, y: B.y, color },
        { x: C.x, y: C.y, color },
        { x: Dx, y: Dy, color },
      ];
    }

    this.stackService.updateFigurePath(figureName, newPath);
  }

  rotate(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string
  ): void {
    if (path.length !== 4) return;

    const centerX = (path[0].x + path[1].x + path[2].x + path[3].x) / 4;
    const centerY = (path[0].y + path[1].y + path[2].y + path[3].y) / 4;

    const rotatedPath = path.map((point) => {
      const dx = point.x - centerX;
      const dy = point.y - centerY;

      return {
        x: centerX - dy,
        y: centerY + dx,
        color: color ?? color ?? '#000000',
      };
    });

    if (figureName) {
      this.stackService.updateFigurePath(figureName, rotatedPath);
    }
  }

  private renderPreview(data: ToolContext): void {
    if (!this.start || !this.end) return;

    const ctx = data.previewCanvas?.getContext('2d');
    if (!ctx) return;

    const path = this.calculateRectPath(
      this.start,
      this.end,
      data.selectedColor
    );

    ctx.clearRect(0, 0, data.previewCanvas.width, data.previewCanvas.height);

    ctx.strokeStyle = toTransparentColor(data.selectedColor);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.closePath();

    ctx.stroke();
  }

  private calculateRectPath(
    start: { x: number; y: number; color: string },
    end: { x: number; y: number; color: string },
    color: string
  ) {
    return [
      { x: start.x, y: start.y, color: color },
      { x: end.x, y: start.y, color: color },
      { x: end.x, y: end.y, color: color },
      { x: start.x, y: end.y, color: color },
    ];
  }

  private addPointsToCanvasService(
    ctx: CanvasRenderingContext2D,
    figureName: string,
    path: { x: number; y: number; color: string }[]
  ): [string, string, string, string] {
    if (!(figureName.length > 1)) {
      figureName = this.counterService.getNextFigureName('Rectangle');
    }
    const labels: string[] = [];

    const xs = path.map((p) => p.x);
    const ys = path.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    path.forEach((point, index) => {
      const label = this.pointsService.addPoint(
        point.x,
        point.y,
        figureName,
        index
      );

      let offsetX = 10;
      let offsetY = -10;

      const isLeft = point.x === minX;
      const isRight = point.x === maxX;
      const isTop = point.y === minY;
      const isBottom = point.y === maxY;

      if (isLeft && isTop) {
        offsetX = -20;
        offsetY = -20;
      } else if (isRight && isTop) {
        offsetX = 20;
        offsetY = -20;
      } else if (isRight && isBottom) {
        offsetX = 20;
        offsetY = 20;
      } else if (isLeft && isBottom) {
        offsetX = -20;
        offsetY = 20;
      }

      drawLabel(ctx, label, point.x, point.y, offsetX, offsetY);

      labels.push(label);
    });

    return [labels[0], labels[1], labels[2], labels[3]];
  }
}
