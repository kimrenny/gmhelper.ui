import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';

export class Pencil implements DrawingTool {
  private isDrawing: boolean = false;
  private path: { x: number; y: number; color: string }[] = [];

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
  ): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);

    path.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });

    ctx.stroke();
    ctx.closePath();
  }

  onMouseDown(pos: { x: number; y: number }, data: ToolContext): void {
    this.isDrawing = true;
    this.path = [{ x: pos.x, y: pos.y, color: data.selectedColor }];
  }

  onMouseMove(pos: { x: number; y: number }, data: ToolContext): void {
    if (!this.isDrawing) return;

    this.path.push({
      x: pos.x,
      y: pos.y,
      color: data.selectedColor,
    });
    this.draw(data.canvas.getContext('2d')!, this.path, data.selectedColor);
  }

  onMouseUp(pos: { x: number; y: number }, data: ToolContext): any {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    const finalPath = [...this.path];
    this.path = [];
    return { tool: this, path: finalPath };
  }

  onMouseLeave(data: ToolContext): any {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.path = [];
  }
}
