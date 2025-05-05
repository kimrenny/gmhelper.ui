import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { CanvasService } from '../services/canvas.service';
import { CounterService } from '../services/counter.service';
import { clearPreviewCanvas } from '../tools/clear-preview';
import { toTransparentColor } from '../utils/preview-color';
import { drawLabel } from '../tools/draw-point-label';

export class Rhombus implements DrawingTool {
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
      const [label1, label2, label3, label4] = this.addPointsToCanvasService(
        ctx,
        path
      );
      this.canvasService.createLine(label1, label2);
      this.canvasService.createLine(label2, label3);
      this.canvasService.createLine(label3, label4);
      this.canvasService.createLine(label1, label4);
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

    if (dx <= 25 && dy <= 25) {
      this.isDrawing = false;
      this.start = null;
      this.end = null;
      clearPreviewCanvas(data);
      return;
    }

    this.end = { x: pos.x, y: pos.y, color: data.selectedColor };
    const path = this.calculateRhombusPath(this.start, this.end);
    const ctx = data.canvas?.getContext('2d');
    if (ctx) this.draw(ctx, path, data.selectedColor);

    if (ctx) {
      const [label1, label2, label3, label4] = this.addPointsToCanvasService(
        ctx,
        path
      );
      this.canvasService.createLine(label1, label2);
      this.canvasService.createLine(label2, label3);
      this.canvasService.createLine(label3, label4);
      this.canvasService.createLine(label1, label4);
    }

    clearPreviewCanvas(data);

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

    const path = this.calculateRhombusPath(this.start, this.end);

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

  private calculateRhombusPath(
    start: { x: number; y: number; color: string },
    end: { x: number; y: number; color: string }
  ) {
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;

    return [
      { x: centerX, y: start.y, color: start.color },
      { x: end.x, y: centerY, color: start.color },
      { x: centerX, y: end.y, color: start.color },
      { x: start.x, y: centerY, color: start.color },
    ];
  }

  private addPointsToCanvasService(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[]
  ): [string, string, string, string] {
    const figureName = this.counterService.getNextFigureName('Rhombus');
    const labels: string[] = [];

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

    return [labels[0], labels[1], labels[2], labels[3]];
  }

  private setLineLengthToService(a: string, b: string, length: number | null) {
    this.canvasService.setLineLength(a, b, length);
  }
}
