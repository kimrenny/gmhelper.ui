import { DrawingTool } from '../interfaces/drawing-tool.interface';

export class Quad implements DrawingTool {
  private points: { x: number; y: number }[] = [];
  private previewPoint: { x: number; y: number } | null = null;

  addPoint(point: { x: number; y: number }): void {
    this.points.push(point);

    if (this.points.length === 2) {
      this.reset();
    }
  }

  setPreviewPoint(point: { x: number; y: number } | null): void {
    this.previewPoint = point;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
  ): void {
    if (this.points.length === 1 && this.previewPoint) {
      const startX = this.points[0].x;
      const startY = this.points[0].y;
      const endX = this.previewPoint.x;
      const endY = this.previewPoint.y;

      const width = endX - startX;
      const height = endY - startY;

      ctx.save();
      ctx.strokeStyle = this.getPreviewColor(color);
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.rect(startX, startY, width, height);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }

    if (path.length === 2) {
      const startX = path[0].x;
      const startY = path[0].y;
      const endX = path[1].x;
      const endY = path[1].y;

      const width = endX - startX;
      const height = endY - startY;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.rect(startX, startY, width, height);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }
  }

  reset(): void {
    this.points = [];
    this.previewPoint = null;
  }

  clear(): void {
    this.reset();
  }

  private getPreviewColor(color: string): string {
    const opacity = 0.5;
    return (
      color +
      Math.floor(opacity * 255)
        .toString(16)
        .padStart(2, '0')
    );
  }
}
