import { DrawingTool } from '../interfaces/drawing-tool.interface';

export class Rhombus implements DrawingTool {
  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
  ): void {
    if (path.length < 4) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.moveTo(path[0].x, path[0].y);
    ctx.lineTo(path[1].x, path[1].y);
    ctx.lineTo(path[2].x, path[2].y);
    ctx.lineTo(path[3].x, path[3].y);
    ctx.lineTo(path[0].x, path[0].y);

    ctx.stroke();
    ctx.closePath();
  }
}
