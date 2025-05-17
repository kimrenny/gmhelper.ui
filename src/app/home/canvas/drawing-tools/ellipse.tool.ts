import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { CanvasService } from '../services/canvas.service';
import { CounterService } from '../services/counter.service';
import { clearPreviewCanvas } from '../tools/clear-preview';
import { toTransparentColor } from '../utils/preview-color';

export class Ellipse implements DrawingTool {
  private start: { x: number; y: number; color: string } | null = null;
  private end: { x: number; y: number; color: string } | null = null;
  private isDrawing: boolean = false;
  private figureName: string = '';

  constructor(
    private canvasService: CanvasService,
    private counterService: CounterService
  ) {}

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[]
  ): void {
    if (path.length !== 2) return;

    const [start, end] = path;
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const radiusX = Math.abs(end.x - start.x) / 2;
    const radiusY = Math.abs(end.y - start.y) / 2;

    ctx.strokeStyle = path[0].color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  onMouseDown(pos: { x: number; y: number }, data: ToolContext): void {
    this.start = {
      x: pos.x,
      y: pos.y,
      color: data.selectedColor,
    };
    this.end = null;
    this.isDrawing = true;
  }

  onMouseMove(pos: { x: number; y: number }, data: ToolContext): void {
    if (!this.isDrawing || !this.start) return;

    this.end = {
      x: pos.x,
      y: pos.y,
      color: data.selectedColor,
    };
    this.renderPreview(data);
  }

  onMouseUp(pos: { x: number; y: number }, data: ToolContext): any {
    if (!this.isDrawing || !this.start) return;

    const dx = Math.abs(pos.x - this.start.x);
    const dy = Math.abs(pos.y - this.start.y);

    if (dx <= 25 || dy <= 25) {
      this.isDrawing = false;
      this.start = null;
      this.end = null;

      clearPreviewCanvas(data);

      return;
    }

    this.figureName = '';

    this.end = {
      x: pos.x,
      y: pos.y,
      color: data.selectedColor,
    };
    const path = [this.start, this.end];
    const ctx = data.canvas?.getContext('2d');
    if (ctx) this.draw(ctx, path);

    if (!(this.figureName.length > 1)) {
      this.figureName = this.counterService.getNextFigureName('Ellipse');
    }

    this.addPointsToCanvasService(path);

    const previewCtx = data.previewCanvas?.getContext('2d');
    if (previewCtx)
      previewCtx.clearRect(
        0,
        0,
        data.previewCanvas.width,
        data.previewCanvas.height
      );

    this.start = null;
    this.end = null;
    this.isDrawing = false;

    return { tool: this, path, figureName: this.figureName };
  }

  onMouseLeave(pos: { x: number; y: number }, data: ToolContext): any {
    if (!this.isDrawing) return;

    this.onMouseUp(pos, data);
  }

  private addPointsToCanvasService(
    path: { x: number; y: number; color: string }[]
  ): void {
    if (!(this.figureName.length > 1)) {
      this.figureName = this.counterService.getNextFigureName('Ellipse');
    }
    const labels: string[] = [];

    path.forEach((point, index) => {
      const label = this.canvasService.addPoint(
        point.x,
        point.y,
        this.figureName,
        index,
        true
      );
    });
  }

  // temporarily does not work because there are no points in the ellipse for storage in the service
  onSelectFigure(
    path: { x: number; y: number }[],
    previewCanvas: HTMLCanvasElement
  ): void {
    console.log('Ellipse selected!');
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    if (path.length !== 2) return;

    const [start, end] = path;
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const radiusX = Math.abs(end.x - start.x) / 2;
    const radiusY = Math.abs(end.y - start.y) / 2;

    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  handleAction(action: string, data: ToolContext, figureName: string): void {
    const ctx = data.canvas?.getContext('2d');
    if (!ctx) return;

    const path = this.canvasService
      .getPointsByFigure(figureName)
      .map((p) => ({ x: p.x, y: p.y }));

    const color = this.canvasService.getFigureColorByName(this.figureName);

    switch (action) {
      case 'drawRadius': {
        this.drawRadius(ctx, path, color);
        break;
      }
      case 'drawDiameter': {
        this.drawDiameter(ctx, path, color);
        break;
      }
      case 'makeCircle': {
        this.makeCircle(ctx, path, color);
        break;
      }
    }
  }

  drawRadius(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
  ): void {}

  drawDiameter(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
  ): void {}

  makeCircle(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
  ): void {
    if (path.length !== 2) return;

    const [start, end] = path;

    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const radiusX = Math.abs(end.x - start.x) / 2;
    const radiusY = Math.abs(end.y - start.y) / 2;
    const radius = Math.min(radiusX, radiusY);

    const newStart = {
      x: centerX - radius,
      y: centerY - radius,
      color: color ?? '#000000',
    };

    const newEnd = {
      x: centerX + radius,
      y: centerY + radius,
      color: color ?? '#000000',
    };

    const figureName = this.figureName;
    if (figureName) {
      this.canvasService.updateFigurePath(figureName, [newStart, newEnd]);
    }
  }

  private renderPreview(data: ToolContext): void {
    if (!this.start || !this.end) return;

    const ctx = data.previewCanvas?.getContext('2d');
    if (!ctx) return;

    const centerX = (this.start.x + this.end.x) / 2;
    const centerY = (this.start.y + this.end.y) / 2;
    const radiusX = Math.abs(this.end.x - this.start.x) / 2;
    const radiusY = Math.abs(this.end.y - this.start.y) / 2;

    ctx.clearRect(0, 0, data.previewCanvas.width, data.previewCanvas.height);

    ctx.strokeStyle = toTransparentColor(data.selectedColor);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
