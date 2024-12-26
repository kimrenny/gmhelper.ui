import { DrawingTool } from './drawing-tool.interface';

export class Rhombus implements DrawingTool {
  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
  ): void {
    if (path.length < 4) return; // Для ромба нужно 4 точки

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Первая точка
    ctx.moveTo(path[0].x, path[0].y);
    // Вторая точка
    ctx.lineTo(path[1].x, path[1].y);
    // Третья точка
    ctx.lineTo(path[2].x, path[2].y);
    // Четвертая точка
    ctx.lineTo(path[3].x, path[3].y);
    // Замыкаем ромб
    ctx.lineTo(path[0].x, path[0].y);

    ctx.stroke();
    ctx.closePath();
  }
}
