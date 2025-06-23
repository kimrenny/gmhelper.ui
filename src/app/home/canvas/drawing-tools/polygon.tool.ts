import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { toTransparentColor } from '../utils/preview-color';
import { CanvasService } from '../services/canvas.service';
import { CounterService } from '../services/counter.service';
import { drawLabel } from '../tools/draw-point-label';
import { clearPreviewCanvas } from '../tools/clear-preview';
import { drawTextAboveLine } from '../tools/draw-text-above-line';
import { LineLength } from './types/line-length.type';
import {
  restoreLineLengthToService,
  setLineLengthToService,
} from '../utils/line-length.utils';
import { PointsService } from '../services/points.service';
import { AnglesService } from '../services/angles.service';
import { LinesService } from '../services/lines.service';
import { FigureElementsService } from '../services/figure-elements.service';
import { FiguresService } from '../services/figures.service';

export class Polygon implements DrawingTool {
  private center: { x: number; y: number } | null = null;
  private radius: number = 0;
  private sides: number;
  private isDrawing: boolean = false;
  private path: { x: number; y: number; color: string }[] = [];
  private figureName: string = '';

  constructor(
    sides: number,
    private canvasService: CanvasService,
    private pointsService: PointsService,
    private linesService: LinesService,
    private anglesService: AnglesService,
    private figureElementsService: FigureElementsService,
    private figuresService: FiguresService,
    private counterService: CounterService
  ) {
    if (sides < 3) {
      throw new Error('Polygon must have at least 3 sides.');
    }
    this.sides = sides;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    redraw: boolean = false
  ): void {
    const drawPath = path ?? this.path;
    if (drawPath.length >= 3) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(drawPath[0].x, drawPath[0].y);
      for (let i = 1; i < drawPath.length; i++) {
        ctx.lineTo(drawPath[i].x, drawPath[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = color;
      for (const point of drawPath) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }
    }

    if (redraw) {
      const labels = this.addPointsToCanvasService(ctx, path);

      for (let i = 0; i < labels.length - 1; i++) {
        const from = labels[i];
        const to = labels[(i + 1) % labels.length];
        this.linesService.createLine(from, to);
        restoreLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          from,
          to
        );
      }

      if (labels.length > 1) {
        const from = labels[0];
        const to = labels[labels.length - 1];
        this.linesService.createLine(from, to);
        restoreLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          from,
          to
        );
      }
    }
  }

  onMouseDown(pos: { x: number; y: number }, data: ToolContext): void {
    this.center = { x: pos.x, y: pos.y };
    this.isDrawing = true;
    this.renderPreview(data);
  }

  onMouseMove(pos: { x: number; y: number }, data: ToolContext): void {
    if (!this.isDrawing || !this.center) return;

    const dx = pos.x - this.center.x;
    const dy = pos.y - this.center.y;
    const distanceX = Math.abs(dx);
    const distanceY = Math.abs(dy);
    const minDistance = Math.min(distanceX, distanceY);

    this.radius = minDistance;

    this.path = this.calculatePolygonPoints(
      this.center.x,
      this.center.y,
      this.radius,
      this.sides,
      data.selectedColor
    );

    this.renderPreview(data);
  }

  onMouseUp(pos: { x: number; y: number }, data: ToolContext): any {
    if (!this.isDrawing) return;

    if (this.radius < 10) {
      this.isDrawing = false;
      this.path = [];
      clearPreviewCanvas(data);

      return;
    }

    const ctx = data.canvas?.getContext('2d');
    if (ctx) this.draw(ctx, this.path, data.selectedColor);

    const previewCtx = data.previewCanvas?.getContext('2d');
    if (previewCtx)
      previewCtx.clearRect(
        0,
        0,
        data.previewCanvas.width,
        data.previewCanvas.height
      );

    const savePath = [...this.path];

    if (ctx) {
      this.figureName = '';
      const labels = this.addPointsToCanvasService(ctx);

      for (let i = 0; i < labels.length - 1; i++) {
        const from = labels[i];
        const to = labels[(i + 1) % labels.length];
        this.linesService.createLine(from, to);
        setLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          from,
          to,
          '?'
        );
      }

      if (labels.length > 1) {
        const from = labels[0];
        const to = labels[labels.length - 1];
        this.linesService.createLine(from, to);
        setLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          from,
          to,
          '?'
        );
      }
    }

    this.center = null;
    this.radius = 0;
    this.isDrawing = false;
    this.path = [];

    return { tool: this, path: savePath, figureName: this.figureName };
  }

  onSelectFigure(
    path: { x: number; y: number }[],
    previewCanvas: HTMLCanvasElement
  ): void {
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const drawPath = path ?? this.path;
    if (drawPath.length >= 3) {
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(drawPath[0].x, drawPath[0].y);
      for (let i = 1; i < drawPath.length; i++) {
        ctx.lineTo(drawPath[i].x, drawPath[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#ffcc00';
      for (const point of drawPath) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }
    }
  }

  handleAction(action: string, data: ToolContext, figureName: string): void {
    const ctx = data.canvas?.getContext('2d');
    if (!ctx) return;

    const path = this.pointsService
      .getPointsByFigure(figureName)
      .map((p) => ({ x: p.x, y: p.y }));

    switch (action) {
      case 'func1': {
        this.firstAction(ctx, path);
        break;
      }
      case 'func2': {
        this.secondAction(ctx, path);
        break;
      }
      case 'func3': {
        this.thirdAction(ctx, path);
        break;
      }
    }
  }

  firstAction(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[]
  ): void {}

  secondAction(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[]
  ): void {}

  thirdAction(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[]
  ): void {}

  private renderPreview(data: ToolContext): void {
    if (!this.isDrawing || !this.center || this.radius <= 0) return;

    const ctx = data.previewCanvas?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, data.previewCanvas.width, data.previewCanvas.height);

    ctx.strokeStyle = toTransparentColor(data.selectedColor);
    ctx.lineWidth = 2;

    const previewPath = this.calculatePolygonPoints(
      this.center.x,
      this.center.y,
      this.radius,
      this.sides,
      data.selectedColor
    );

    ctx.beginPath();
    ctx.moveTo(previewPath[0].x, previewPath[0].y);
    for (let i = 1; i < previewPath.length; i++) {
      ctx.lineTo(previewPath[i].x, previewPath[i].y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  private calculatePolygonPoints(
    cx: number,
    cy: number,
    radius: number,
    sides: number,
    color: string
  ): { x: number; y: number; color: string }[] {
    const points: { x: number; y: number; color: string }[] = [];
    const angleStep = (2 * Math.PI) / sides;

    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push({ x, y, color: color });
    }

    return points;
  }

  private addPointsToCanvasService(
    ctx: CanvasRenderingContext2D,
    path?: { x: number; y: number }[]
  ): string[] {
    if (!(this.figureName.length > 1)) {
      this.figureName = this.counterService.getNextFigureName('Polygon');
    }

    const labels: string[] = [];
    const pointsToProcess = path && path.length > 0 ? path : this.path;

    if (!pointsToProcess || pointsToProcess.length === 0) {
      console.warn('Path is empty. No points to add.');
      return labels;
    }

    pointsToProcess.forEach((point, index) => {
      const label = this.pointsService.addPoint(
        point.x,
        point.y,
        this.figureName,
        index
      );

      if (!label) {
        console.error(`Label was not returned for point at index ${index}`);
      }

      drawLabel(ctx, label, point.x, point.y);
      labels.push(label);
    });

    return labels;
  }
}
