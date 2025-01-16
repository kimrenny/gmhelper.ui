import { DrawingTool } from './drawing-tool.interface';

export class Polygon implements DrawingTool {
  private vertices: { x: number; y: number }[] = [];
  private polygons: { x: number; y: number }[][] = [];
  private previewPoint: { x: number; y: number } | null = null;
  private vertexCount: number = 0;

  isSetupComplete(): boolean {
    return this.vertexCount > 0;
  }

  setVertexCount(): void {
    const userInput = prompt(
      'Введите количество углов многоугольника (от 3 до 8):'
    );
    const count = parseInt(userInput || '', 10);

    if (isNaN(count) || count < 3 || count > 8) {
      alert('Некорректное значение. Введите число от 3 до 8.');
      this.setVertexCount();
    } else {
      this.vertexCount = count;
      this.reset();
    }
  }

  addPoint(point: { x: number; y: number }): void {
    if (this.vertices.length < this.vertexCount) {
      this.vertices.push(point);
    }

    if (this.vertices.length === this.vertexCount) {
      this.polygons.push([...this.vertices]);
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
    this.polygons.forEach((polygon) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(polygon[0].x, polygon[0].y);

      polygon.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });

      ctx.lineTo(polygon[0].x, polygon[0].y);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    });

    if (this.vertices.length > 0) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(this.vertices[0].x, this.vertices[0].y);

      for (let i = 1; i < this.vertices.length; i++) {
        ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
      }

      if (this.previewPoint) {
        ctx.lineTo(this.previewPoint.x, this.previewPoint.y);
      }

      ctx.stroke();
      ctx.restore();
    }
  }

  reset(): void {
    this.vertices = [];
    this.previewPoint = null;
  }

  clear(): void {
    this.polygons = [];
    this.vertices = [];
    this.previewPoint = null;
    this.vertexCount = 0;
  }
}
