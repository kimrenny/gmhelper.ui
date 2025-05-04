import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { CanvasService } from '../services/canvas.service';
import { CounterService } from '../services/counter.service';
import { toTransparentColor } from '../utils/preview-color';

export class Rectangle implements DrawingTool {
  private start: { x: number; y: number; color: string } | null = null;
  private end: { x: number; y: number; color: string } | null = null;
  private isDrawing: boolean = false;

  private canvasService: CanvasService;
  private counterService: CounterService;

  constructor(canvasService: CanvasService, counterService: CounterService) {
    this.canvasService = canvasService;
    this.counterService = counterService;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[]
  ): void {
    if (path.length !== 4) return;

    ctx.strokeStyle = path[0].color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = path[0].color;
    for (const point of path) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
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

    this.end = { x: pos.x, y: pos.y, color: data.selectedColor };
    const path = this.calculateRectPath(
      this.start,
      this.end,
      data.selectedColor
    );
    const ctx = data.canvas?.getContext('2d');
    if (ctx) this.draw(ctx, path);

    this.addPointsToCanvasService(path);

    const previewCtx = data.previewCanvas?.getContext('2d');
    if (previewCtx)
      previewCtx.clearRect(
        0,
        0,
        data.previewCanvas.width,
        data.previewCanvas.height
      );

    this.start = null;
    this.end = null;
    this.isDrawing = false;

    return { tool: this, path };
  }

  onMouseLeave(pos: { x: number; y: number }, data: ToolContext): any {
    if (!this.isDrawing) return;

    this.onMouseUp(pos, data);
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
    path: { x: number; y: number; color: string }[]
  ): void {
    const figureName = this.counterService.getNextFigureName('Rectangle');
    path.forEach((point, index) => {
      this.canvasService.addPoint(point.x, point.y, figureName, index);
    });
  }
}
