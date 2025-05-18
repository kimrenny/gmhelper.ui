import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { CanvasService } from '../services/canvas.service';
import { CounterService } from '../services/counter.service';
import { clearPreviewCanvas } from '../tools/clear-preview';
import { drawLabel } from '../tools/draw-point-label';
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
    path: { x: number; y: number; color: string }[],
    color?: string,
    redraw?: boolean
  ): void {
    if (path.length !== 2) return;

    const [start, end] = path;
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const radiusX = Math.abs(end.x - start.x) / 2;
    const radiusY = Math.abs(end.y - start.y) / 2;

    ctx.strokeStyle = color ?? path[0].color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (redraw) {
      console.log('[Ellipse::draw] redraw path:', path);

      this.addPointsToCanvasService(path);
      const figureName = this.canvasService.getFigureNameByCoords({
        x: path[0].x,
        y: path[0].y,
      });

      console.log('[Ellipse::draw] resolved figureName:', figureName);

      if (figureName) {
        this.drawLinesFromFigureData(ctx, figureName);
      } else {
        console.warn('[Ellipse::draw] No figure name found for coords:', path);
      }
    }
  }

  private drawLinesFromFigureData(
    ctx: CanvasRenderingContext2D,
    figureName: string
  ): void {
    const allPaths = this.canvasService.getPaths();

    const relevantLines = allPaths.filter(
      (point) => point.figureName === figureName && point.path.length == 2
    );

    console.log('[Ellipse::drawLinesFromFigureData] allPaths:', allPaths);
    console.log(
      '[Ellipse::drawLinesFromFigureData] relevantLines for',
      figureName,
      ':',
      relevantLines
    );

    for (let i = 0; i < relevantLines.length; i++) {
      const line = relevantLines[i];
      console.log(
        `[Ellipse::drawLinesFromFigureData] drawing line ${i}:`,
        line.path
      );

      ctx.beginPath();
      ctx.moveTo(line.path[0].x, line.path[0].y);
      ctx.lineTo(line.path[1].x, line.path[1].y);
      ctx.strokeStyle = line.path[0].color || '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
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

  onSelectFigure(
    path: { x: number; y: number }[],
    previewCanvas: HTMLCanvasElement
  ): void {
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
        this.drawRadius(ctx, path, color, figureName);
        break;
      }
      case 'drawDiameter': {
        this.drawDiameter(ctx, path, color, figureName);
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
    color: string,
    figureName: string
  ): void {}

  drawDiameter(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string
  ): void {
    if (path.length !== 2) return;

    const radiusX = Math.abs(path[0].x - path[1].x) / 2;
    const radiusY = Math.abs(path[0].y - path[1].y) / 2;

    console.log('[drawDiameter] original path:', path);

    if (radiusX !== radiusY) {
      console.log('[drawDiameter] not a circle — calling makeCircle');

      const adjustedPath = this.makeCircle(ctx, path, color);
      if (adjustedPath) {
        path = adjustedPath;
      }
    }

    console.log('[drawDiameter] final start and end:', path);

    const firstPoint = {
      x: path[0].x,
      y: (path[0].y + path[1].y) / 2,
    };

    const secondPoint = {
      x: path[1].x,
      y: (path[0].y + path[1].y) / 2,
    };

    console.log(
      '[drawDiameter] firstPoint:',
      firstPoint,
      'secondPoint:',
      secondPoint
    );

    ctx.strokeStyle = color ?? '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    ctx.lineTo(secondPoint.x, secondPoint.y);
    ctx.stroke();

    const labelA = this.canvasService.addPoint(
      firstPoint.x,
      firstPoint.y,
      figureName,
      0
    );
    drawLabel(ctx, labelA, firstPoint.x, firstPoint.y);

    const labelB = this.canvasService.addPoint(
      secondPoint.x,
      secondPoint.y,
      figureName,
      1
    );
    drawLabel(ctx, labelB, secondPoint.x, secondPoint.y);

    this.canvasService.createLine(labelA, labelB);
  }

  makeCircle(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
  ): { x: number; y: number }[] | void {
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

    return [newStart, newEnd];
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
