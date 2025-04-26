import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { toTransparentColor } from '../utils/preview-color';

export class Rhombus implements DrawingTool {
  private start: { x: number; y: number } | null = null;
  private end: { x: number; y: number } | null = null;
  private isDrawing: boolean = false;

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
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
  }

  onMouseDown(pos: { x: number; y: number }, data: ToolContext): void {
    this.start = pos;
    this.end = null;
    this.isDrawing = true;
  }

  onMouseMove(pos: { x: number; y: number }, data: ToolContext): void {
    if (!this.isDrawing || !this.start) return;

    this.end = pos;
    this.renderPreview(data);
  }

  onMouseUp(pos: { x: number; y: number }, data: ToolContext): any {
    if (!this.isDrawing || !this.start) return;

    this.end = pos;
    const path = this.calculateRhombusPath(this.start, this.end);
    const ctx = data.canvas?.getContext('2d');
    if (ctx) this.draw(ctx, path, data.selectedColor);

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
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) {
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;

    return [
      { x: centerX, y: start.y }, // Верх
      { x: end.x, y: centerY }, // Право
      { x: centerX, y: end.y }, // Низ
      { x: start.x, y: centerY }, // Лево
    ];
  }
}
