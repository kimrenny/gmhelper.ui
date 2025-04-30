import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { toTransparentColor } from '../utils/preview-color';

export class Parallelogram implements DrawingTool {
  private path: { x: number; y: number }[] = [];
  private isDrawing: boolean = false;
  private end: { x: number; y: number } | null = null;

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
  ): void {
    const drawPath = path ?? this.path;
    if (drawPath.length === 4) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(drawPath[0].x, drawPath[0].y);
      ctx.lineTo(drawPath[1].x, drawPath[1].y);
      ctx.lineTo(drawPath[2].x, drawPath[2].y);
      ctx.lineTo(drawPath[3].x, drawPath[3].y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  onMouseDown(pos: { x: number; y: number }, data: ToolContext): void {
    if (this.path.length < 3) {
      this.path.push({ x: pos.x, y: pos.y });
      this.isDrawing = true;
      this.renderPreview(data);
    }
  }

  onMouseMove(pos: { x: number; y: number }, data: ToolContext): void {
    if (this.isDrawing) {
      this.end = { x: pos.x, y: pos.y };
      this.renderPreview(data);
    }
  }

  onMouseUp(pos: { x: number; y: number }, data: ToolContext): any {
    if (!this.isDrawing) return;

    if (this.path.length < 3) {
      this.renderPreview(data);
    } else if (this.path.length === 3) {
      const fourthPoint = {
        x: this.path[0].x + (this.path[2].x - this.path[1].x),
        y: this.path[0].y + (this.path[2].y - this.path[1].y),
      };
      this.path.push(fourthPoint);

      const savePath = [...this.path];
      this.path = [];
      this.isDrawing = false;
      this.end = null;

      const ctx = data.canvas?.getContext('2d');
      if (ctx) this.draw(ctx, savePath, data.selectedColor);

      const previewCtx = data.previewCanvas?.getContext('2d');
      if (previewCtx)
        previewCtx.clearRect(
          0,
          0,
          data.previewCanvas.width,
          data.previewCanvas.height
        );

      return { tool: this, path: savePath };
    }
  }

  private renderPreview(data: ToolContext): void {
    if (!this.isDrawing || !this.end || this.path.length === 0) return;

    const ctx = data.previewCanvas?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, data.previewCanvas.width, data.previewCanvas.height);

    ctx.strokeStyle = toTransparentColor(data.selectedColor);
    ctx.lineWidth = 2;

    if (this.path.length === 1) {
      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      ctx.lineTo(this.end.x, this.end.y);
      ctx.stroke();
      ctx.closePath();
    }

    if (this.path.length === 2) {
      const fourthPoint = {
        x: this.path[0].x + (this.end.x - this.path[1].x),
        y: this.path[0].y + (this.end.y - this.path[1].y),
      };

      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      ctx.lineTo(this.path[1].x, this.path[1].y);
      ctx.lineTo(this.end.x, this.end.y);
      ctx.lineTo(fourthPoint.x, fourthPoint.y);
      ctx.closePath();
      ctx.stroke();
    }

    if (this.path.length === 3) {
      const fourthPoint = {
        x: this.path[0].x + (this.end.x - this.path[1].x),
        y: this.path[0].y + (this.end.y - this.path[1].y),
      };

      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      ctx.lineTo(this.path[1].x, this.path[1].y);
      ctx.lineTo(this.end.x, this.end.y);
      ctx.lineTo(fourthPoint.x, fourthPoint.y);
      ctx.closePath();
      ctx.stroke();
    }
  }
}
