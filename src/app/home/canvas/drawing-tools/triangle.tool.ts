import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { CanvasService } from '../services/canvas.service';
import { CounterService } from '../services/counter.service';
import { toTransparentColor } from '../utils/preview-color';
import { drawLabel } from '../tools/draw-point-label';
import { drawTextAboveLine } from '../tools/draw-text-above-line';
import { LineLength } from './types/line-length.type';

export class Triangle implements DrawingTool {
  private path: { x: number; y: number; color: string }[] = [];
  private isDrawing: boolean = false;
  private end: { x: number; y: number } | null = null;
  private figureName: string = '';

  private canvasService: CanvasService;
  private counterService: CounterService;

  constructor(canvasService: CanvasService, counterService: CounterService) {
    this.canvasService = canvasService;
    this.counterService = counterService;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[],
    color: string,
    redraw: boolean = false
  ): void {
    const drawPath = path ?? this.path;
    if (drawPath.length === 3) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(drawPath[0].x, drawPath[0].y);
      ctx.lineTo(drawPath[1].x, drawPath[1].y);
      ctx.lineTo(drawPath[2].x, drawPath[2].y);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = color;
      for (const point of drawPath) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    if (redraw) {
      const [label1, label2, label3] = this.addPointsToCanvasService(ctx, path);
      this.canvasService.createLine(label1, label2);
      this.canvasService.createLine(label2, label3);
      this.canvasService.createLine(label1, label3);
      this.setLineLengthToService(ctx, label1, label2, '?');
      this.setLineLengthToService(ctx, label2, label3, '?');
      this.setLineLengthToService(ctx, label1, label3, '?');
    }
  }

  onMouseDown(pos: { x: number; y: number }, data: ToolContext): void {
    if (this.path.length < 3) {
      this.path.push({ x: pos.x, y: pos.y, color: data.selectedColor });
      this.isDrawing = true;
      this.renderPreview(data);
    }
  }

  onMouseMove(pos: { x: number; y: number }, data: ToolContext): void {
    if (this.isDrawing) {
      this.end = { x: pos.x, y: pos.y };
      this.renderPreview(data);
    }
  }

  onMouseUp(pos: { x: number; y: number }, data: ToolContext): any {
    if (this.isDrawing && this.path.length === 1) {
      this.renderPreview(data);
    } else if (this.isDrawing && this.path.length === 2) {
      this.renderPreview(data);
    } else if (this.isDrawing && this.path.length === 3) {
      const savePath = [...this.path];

      const ctx = data.canvas?.getContext('2d');
      if (ctx) {
        this.figureName = '';
        const [label1, label2, label3] = this.addPointsToCanvasService(ctx);
        this.canvasService.createLine(label1, label2);
        this.canvasService.createLine(label2, label3);
        this.canvasService.createLine(label1, label3);
        this.setLineLengthToService(ctx, label1, label2, '?');
        this.setLineLengthToService(ctx, label2, label3, '?');
        this.setLineLengthToService(ctx, label1, label3, '?');
      }

      this.path = [];
      this.isDrawing = false;
      this.end = null;

      if (ctx) this.draw(ctx, savePath, data.selectedColor);

      const previewCtx = data.previewCanvas?.getContext('2d');
      if (previewCtx)
        previewCtx.clearRect(
          0,
          0,
          data.previewCanvas.width,
          data.previewCanvas.height
        );

      return { tool: this, path: savePath, figureName: this.figureName };
    }
  }

  private renderPreview(data: ToolContext): void {
    if (!this.isDrawing || !this.end || this.path.length === 0) return;

    const ctx = data.previewCanvas?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, data.previewCanvas.width, data.previewCanvas.height);

    ctx.strokeStyle = toTransparentColor(data.selectedColor);
    ctx.lineWidth = 2;

    if (this.path.length === 1) {
      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      ctx.lineTo(this.end.x, this.end.y);
      ctx.stroke();
      ctx.closePath();
    }

    if (this.path.length === 2) {
      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      ctx.lineTo(this.path[1].x, this.path[1].y);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.moveTo(this.path[1].x, this.path[1].y);
      ctx.lineTo(this.end.x, this.end.y);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      ctx.lineTo(this.end.x, this.end.y);
      ctx.stroke();
      ctx.closePath();
    }

    if (this.path.length === 3) {
      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      ctx.lineTo(this.path[1].x, this.path[1].y);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.moveTo(this.path[1].x, this.path[1].y);
      ctx.lineTo(this.path[2].x, this.path[2].y);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.moveTo(this.path[2].x, this.path[2].y);
      ctx.lineTo(this.path[0].x, this.path[0].y);
      ctx.stroke();
      ctx.closePath();
    }
  }

  private addPointsToCanvasService(
    ctx: CanvasRenderingContext2D,
    path?: { x: number; y: number }[]
  ): [string, string, string] {
    if (!(this.figureName.length > 1)) {
      this.figureName = this.counterService.getNextFigureName('Triangle');
    }
    const labels: string[] = [];

    if (!path) {
      this.path.forEach((point, index) => {
        const label = this.canvasService.addPoint(
          point.x,
          point.y,
          this.figureName,
          index
        );

        drawLabel(ctx, label, point.x, point.y);

        labels.push(label);
      });

      return [labels[0], labels[1], labels[2]];
    }
    if (!(this.figureName.length > 1)) {
      this.figureName = this.counterService.getNextFigureName('Triangle');
    }

    path.forEach((point, index) => {
      const label = this.canvasService.addPoint(
        point.x,
        point.y,
        this.figureName,
        index
      );

      drawLabel(ctx, label, point.x, point.y);

      labels.push(label);
    });

    return [labels[0], labels[1], labels[2]];
  }

  private setLineLengthToService(
    ctx: CanvasRenderingContext2D,
    a: string,
    b: string,
    length: LineLength,
    offsetX: number = 0,
    offsetY: number = -10,
    fontsize: number = 14,
    color: string = 'black'
  ) {
    this.canvasService.setLineLength(a, b, length);

    const pointA = this.canvasService.getPointByLabel(a);
    const pointB = this.canvasService.getPointByLabel(b);

    if (!pointA || !pointB) return;

    if (!ctx) return;

    drawTextAboveLine(
      ctx,
      pointA,
      pointB,
      length,
      offsetX,
      offsetY,
      fontsize,
      color
    );
  }
}
