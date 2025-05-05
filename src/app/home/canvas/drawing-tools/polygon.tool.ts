import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { toTransparentColor } from '../utils/preview-color';
import { CanvasService } from '../services/canvas.service';
import { CounterService } from '../services/counter.service';

export class Polygon implements DrawingTool {
  private center: { x: number; y: number } | null = null;
  private radius: number = 0;
  private sides: number;
  private isDrawing: boolean = false;
  private path: { x: number; y: number; color: string }[] = [];

  private canvasService: CanvasService;
  private counterService: CounterService;

  constructor(
    sides: number,
    canvasService: CanvasService,
    counterService: CounterService
  ) {
    if (sides < 3) {
      throw new Error('Polygon must have at least 3 sides.');
    }
    this.sides = sides;

    this.canvasService = canvasService;
    this.counterService = counterService;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
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

    if (ctx) this.addPointsToCanvasService(ctx);

    this.center = null;
    this.radius = 0;
    this.isDrawing = false;
    this.path = [];

    return { tool: this, path: savePath };
  }

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

  private addPointsToCanvasService(ctx: CanvasRenderingContext2D): void {
    const figureName = this.counterService.getNextFigureName('Polygon');
    this.path.forEach((point, index) => {
      const label = this.canvasService.addPoint(
        point.x,
        point.y,
        figureName,
        index
      );

      ctx.font = '16px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText(label, point.x + 10, point.y - 10);
    });
  }
}
