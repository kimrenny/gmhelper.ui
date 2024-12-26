import { DrawingTool } from './drawing-tool.interface';

export class Ellipse implements DrawingTool {
  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
  ): void {
    if (path.length < 2) return;

    const startX = path[0].x;
    const startY = path[0].y;
    const endX = path[path.length - 1].x;
    const endY = path[path.length - 1].y;

    const radiusX = Math.abs(endX - startX) / 2;
    const radiusY = Math.abs(endY - startY) / 2;

    const centerX = (startX + endX) / 2;
    const centerY = (startY + endY) / 2;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
  }
}
