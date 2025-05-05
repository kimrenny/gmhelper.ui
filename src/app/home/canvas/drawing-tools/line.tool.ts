import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { CanvasService } from '../services/canvas.service';
import { CounterService } from '../services/counter.service';
import { toTransparentColor } from '../utils/preview-color';
import { drawLabel } from '../tools/draw-point-label';

export class Line implements DrawingTool {
  private isDrawing: boolean = false;
  private path: { x: number; y: number; color: string }[] = [];
  private previewEnd: { x: number; y: number } | null = null;

  constructor(
    private canvasService: CanvasService,
    private counterService: CounterService
  ) {}

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    redraw: boolean = false
  ): void {
    if (path.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    ctx.lineTo(path[1].x, path[1].y);
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = color;
    for (const point of [path[0], path[1]]) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }

    if (redraw) {
      const [label1, label2] = this.addPointsToCanvasService(ctx, path);
      this.canvasService.createLine(label1, label2);
    }
  }

  renderPreview(data: ToolContext): void {
    if (!this.isDrawing || !this.previewEnd || !data.previewCanvas) return;

    const ctx = data.previewCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, data.previewCanvas.width, data.previewCanvas.height);

    const start = this.path[0];
    const end = this.previewEnd;

    ctx.strokeStyle = toTransparentColor(start.color);
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
  }

  onMouseDown(pos: { x: number; y: number }, data: ToolContext): void {
    if (this.isDrawing) return;

    this.isDrawing = true;
    this.previewEnd = null;
    this.path = [{ x: pos.x, y: pos.y, color: data.selectedColor }];
  }

  onMouseMove(pos: { x: number; y: number }, data: ToolContext): void {
    if (!this.isDrawing) return;

    this.previewEnd = {
      x: pos.x,
      y: pos.y,
    };

    this.renderPreview(data);
  }

  onMouseUp(pos: { x: number; y: number }, data: ToolContext): any {
    if (!this.isDrawing) return;

    const dx = Math.abs(pos.x - this.path[0].x);
    const dy = Math.abs(pos.y - this.path[0].y);

    if (dx <= 5 && dy <= 5) {
      this.isDrawing = false;
      this.path = [];
      this.previewEnd = null;
      return;
    }

    this.path.push({
      x: pos.x,
      y: pos.y,
      color: data.selectedColor,
    });

    const ctx = data.canvas.getContext('2d');
    if (ctx) {
      this.draw(ctx, this.path, data.selectedColor);
    }

    if (data.previewCanvas) {
      const previewCtx = data.previewCanvas.getContext('2d');
      previewCtx?.clearRect(
        0,
        0,
        data.previewCanvas.width,
        data.previewCanvas.height
      );
    }

    this.isDrawing = false;
    if (this.path.length > 1) {
      if (ctx) {
        const [label1, label2] = this.addPointsToCanvasService(ctx);
        this.canvasService.createLine(label1, label2);
      }
      this.previewEnd = null;
      const savePath = [...this.path];
      this.path = [];
      return { tool: this, path: savePath };
    }
    this.path = [];
    this.previewEnd = null;
  }

  onMouseLeave(pos: { x: number; y: number }, data: ToolContext): any {
    if (!this.isDrawing) return;

    this.path.push({
      x: pos.x,
      y: pos.y,
      color: data.selectedColor,
    });

    const ctx = data.canvas.getContext('2d');
    if (ctx) {
      this.draw(ctx, this.path, data.selectedColor);

      const [label1, label2] = this.addPointsToCanvasService(ctx);
      this.canvasService.createLine(label1, label2);
    }

    if (data.previewCanvas) {
      const previewCtx = data.previewCanvas.getContext('2d');
      previewCtx?.clearRect(
        0,
        0,
        data.previewCanvas.width,
        data.previewCanvas.height
      );
    }

    this.isDrawing = false;
    if (this.path.length > 1) {
      this.previewEnd = null;
      const finalPath = [...this.path];
      this.path = [];
      return { tool: this, path: finalPath };
    }
    this.path = [];
    this.previewEnd = null;
  }

  private addPointsToCanvasService(
    ctx: CanvasRenderingContext2D,
    path?: { x: number; y: number }[]
  ): [string, string] {
    const figureName = this.counterService.getNextFigureName('Line');
    const labels: string[] = [];

    if (!path) {
      this.path.forEach((point, index) => {
        const label = this.canvasService.addPoint(
          point.x,
          point.y,
          figureName,
          index
        );

        drawLabel(ctx, label, point.x, point.y);

        labels.push(label);
      });

      return [labels[0], labels[1]];
    }

    path.forEach((point, index) => {
      const label = this.canvasService.addPoint(
        point.x,
        point.y,
        figureName,
        index
      );

      drawLabel(ctx, label, point.x, point.y);

      labels.push(label);
    });

    return [labels[0], labels[1]];
  }

  private setLineLengthToService(a: string, b: string, length: number | null) {
    this.canvasService.setLineLength(a, b, length);
  }
}
