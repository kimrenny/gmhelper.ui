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

  onMouseDown(event: MouseEvent, data: ToolContext): void {
    this.isDrawing = true;
    this.path = [
      { x: event.offsetX, y: event.offsetY, color: data.selectedColor },
    ];
  }

  onMouseMove(event: MouseEvent, data: ToolContext): void {
    if (!this.isDrawing) return;

    this.path.push({
      x: event.offsetX,
      y: event.offsetY,
      color: data.selectedColor,
    });
    this.draw(data.canvas.getContext('2d')!, this.path, data.selectedColor);
  }

  onMouseUp(event: MouseEvent, data: ToolContext): void {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    data.paths.push({ tool: this, path: this.path });
    this.path = [];
  }

  onMouseLeave(event: MouseEvent, data: ToolContext): void {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    data.paths.push({ tool: this, path: this.path });
    this.path = [];
  }
}
