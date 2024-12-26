import { DrawingTool } from './drawing-tool.interface';

export class Pencil implements DrawingTool {
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
}
