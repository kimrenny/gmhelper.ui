import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';

export class Line implements DrawingTool {
  private isDrawing: boolean = false;
  private path: { x: number; y: number; color: string }[] = [];
  private previewEnd: { x: number; y: number } | null = null;

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
    ctx.lineTo(path[1].x, path[1].y);
    ctx.stroke();
    ctx.closePath();
  }

  renderPreview(data: ToolContext): void {
    if (!this.isDrawing || !this.previewEnd || !data.previewCanvas) return;

    const ctx = data.previewCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, data.previewCanvas.width, data.previewCanvas.height);

    const start = this.path[0];
    const end = this.previewEnd;

    ctx.strokeStyle = this.toTransparentColor(start.color);
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
  }

  onMouseDown(event: MouseEvent, data: ToolContext): void {
    if (this.isDrawing) return;

    this.isDrawing = true;
    this.previewEnd = null;
    this.path = [
      { x: event.offsetX, y: event.offsetY, color: data.selectedColor },
    ];
  }

  onMouseMove(event: MouseEvent, data: ToolContext): void {
    if (!this.isDrawing) return;

    this.previewEnd = {
      x: event.offsetX,
      y: event.offsetY,
    };

    this.renderPreview(data);
  }

  onMouseUp(event: MouseEvent, data: ToolContext): void {
    if (!this.isDrawing) return;

    this.path.push({
      x: event.offsetX,
      y: event.offsetY,
      color: data.selectedColor,
    });

    const ctx = data.canvas.getContext('2d');
    if (ctx) {
      this.draw(ctx, this.path, data.selectedColor);
    }

    if (data.previewCanvas) {
      const previewCtx = data.previewCanvas.getContext('2d');
      previewCtx?.clearRect(
        0,
        0,
        data.previewCanvas.width,
        data.previewCanvas.height
      );
    }

    this.isDrawing = false;
    if (this.path.length > 1) {
      data.paths.push({ tool: this, path: this.path });
    }
    this.path = [];
    this.previewEnd = null;
  }

  onMouseLeave(event: MouseEvent, data: ToolContext): void {
    if (!this.isDrawing) return;

    this.path.push({
      x: event.offsetX,
      y: event.offsetY,
      color: data.selectedColor,
    });

    const ctx = data.canvas.getContext('2d');
    if (ctx) {
      this.draw(ctx, this.path, data.selectedColor);
    }

    if (data.previewCanvas) {
      const previewCtx = data.previewCanvas.getContext('2d');
      previewCtx?.clearRect(
        0,
        0,
        data.previewCanvas.width,
        data.previewCanvas.height
      );
    }

    this.isDrawing = false;
    if (this.path.length > 1) {
      data.paths.push({ tool: this, path: this.path });
    }
    this.path = [];
    this.previewEnd = null;
  }

  private toTransparentColor(color: string): string {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r},${g},${b},0.4)`;
    }
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', ',0.4)');
    }
    return color;
  }
}
