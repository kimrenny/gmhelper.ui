import { DrawingTool } from './drawing-tool.interface';

export class Triangle implements DrawingTool {
  public points: { x: number; y: number }[] = [];
  private triangles: { x: number; y: number }[][] = [];
  private previewPoint: { x: number; y: number } | null = null;

  addPoint(point: { x: number; y: number }): void {
    this.previewPoint = null;
    if (this.points.length < 3) {
      this.points.push(point);
    }

    if (this.points.length === 3) {
      this.triangles.push([...this.points]);
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
    this.triangles.forEach((triangle) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(triangle[0].x, triangle[0].y);
      ctx.lineTo(triangle[1].x, triangle[1].y);
      ctx.lineTo(triangle[2].x, triangle[2].y);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    });

    if (this.points.length > 0) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);

      if (this.points.length >= 2) {
        ctx.lineTo(this.points[1].x, this.points[1].y);
      }

      if (this.points.length === 3) {
        ctx.lineTo(this.points[2].x, this.points[2].y);
        ctx.closePath();
      }
      ctx.stroke();
      ctx.restore();
    }

    if (this.previewPoint) {
      ctx.save();
      ctx.strokeStyle = this.getPreviewColor(color);
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);

      if (this.points.length === 1) {
        ctx.lineTo(this.previewPoint.x, this.previewPoint.y);
      } else if (this.points.length === 2) {
        ctx.lineTo(this.points[1].x, this.points[1].y);
        ctx.lineTo(this.previewPoint.x, this.previewPoint.y);
        ctx.lineTo(this.points[0].x, this.points[0].y);
      }
      ctx.stroke();

      ctx.restore();
    }
  }

  reset(): void {
    this.points = [];
    this.previewPoint = null;
  }

  clear(): void {
    this.triangles = [];
    this.points = [];
    this.previewPoint = null;
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
