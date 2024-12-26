import { last } from 'rxjs';
import { DrawingTool } from './drawing-tool.interface';

export class Line implements DrawingTool {
  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
  ): void {
    if (path.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(path[0].x, path[0].y);

    const lastPoint = path[path.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y);

    ctx.stroke();
    ctx.closePath();
  }
}
