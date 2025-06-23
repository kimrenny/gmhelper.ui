import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { AnglesService } from '../services/angles.service';
import { CanvasService } from '../services/canvas.service';
import { CounterService } from '../services/counter.service';
import { FigureElementsService } from '../services/figure-elements.service';
import { FiguresService } from '../services/figures.service';
import { LinesService } from '../services/lines.service';
import { PointsService } from '../services/points.service';
import { StackService } from '../services/stack.service';
import { clearPreviewCanvas } from '../tools/clear-preview';
import { drawLabel } from '../tools/draw-point-label';
import { setLineLengthToService } from '../utils/line-length.utils';
import { toTransparentColor } from '../utils/preview-color';

export class Ellipse implements DrawingTool {
  private start: { x: number; y: number; color: string } | null = null;
  private end: { x: number; y: number; color: string } | null = null;
  private isDrawing: boolean = false;

  constructor(
    private canvasService: CanvasService,
    private pointsService: PointsService,
    private linesService: LinesService,
    private anglesService: AnglesService,
    private figureElementsService: FigureElementsService,
    private stackService: StackService,
    private figuresService: FiguresService,
    private counterService: CounterService
  ) {}

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[],
    color?: string,
    redraw?: boolean
  ): void {
    if (path.length !== 2) return;

    let [start, end] = path;

    let figureName: string | null = null;
    if (redraw) {
      figureName = this.figuresService.getFigureNameByCoords({
        x: start.x,
        y: start.y,
      });

      this.counterService.incrementCounter();

      if (figureName) {
        const hasRadius = this.figureElementsService.hasFigureElement(
          figureName,
          'radius'
        );
        const hasDiameter = this.figureElementsService.hasFigureElement(
          figureName,
          'diameter'
        );

        if (hasRadius || hasDiameter) {
          const newPath = this.makeCircle(
            ctx,
            [start, end],
            color ?? start.color,
            figureName
          );
          if (newPath) {
            [start, end] = newPath.map((p) => ({
              ...p,
              color: color ?? start.color,
            }));
          }
        }
      }
    }

    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const radiusX = Math.abs(end.x - start.x) / 2;
    const radiusY = Math.abs(end.y - start.y) / 2;

    ctx.strokeStyle = color ?? path[0].color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (redraw && figureName) {
      this.drawLinesFromFigureData(ctx, path, figureName, false);
    }
  }

  private drawLinesFromFigureData(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[],
    figureName: string,
    isPreview: boolean = false
  ): void {
    const hasDiameter = this.figureElementsService.hasFigureElement(
      figureName,
      'diameter'
    );
    const hasRadius = this.figureElementsService.hasFigureElement(
      figureName,
      'radius'
    );

    const color = path[0].color ?? '#000';
    const paths = path.map((p) => ({
      x: p.x,
      y: p.y,
    }));

    if (hasDiameter) {
      this.drawDiameter(ctx, paths, color, figureName, isPreview, true);
    }

    if (hasRadius) {
      this.drawRadius(
        ctx,
        paths,
        color,
        figureName,
        hasDiameter,
        isPreview,
        true
      );
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

    let figureName = this.counterService.getNextFigureName('Ellipse');

    this.end = {
      x: pos.x,
      y: pos.y,
      color: data.selectedColor,
    };
    const path = [this.start, this.end];
    const ctx = data.canvas?.getContext('2d');

    if (ctx) this.draw(ctx, path);

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

    return { tool: this, path, figureName: figureName };
  }

  onMouseLeave(pos: { x: number; y: number }, data: ToolContext): any {
    if (!this.isDrawing) return;

    this.onMouseUp(pos, data);
  }

  onSelectFigure(
    path: { x: number; y: number }[],
    previewCanvas: HTMLCanvasElement
  ): void {
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) {
      console.warn('[onSelectFigure] canvas context is null');
      return;
    }

    if (path.length < 2) {
      console.warn('[onSelectFigure] path length less than 2:', path.length);
      return;
    }

    const figureName = this.figuresService.getFigureNameByCoords(path[0]);
    if (!figureName) {
      console.warn('[onSelectFigure] no figure name found for coords.');
      return;
    }

    const paths = this.stackService.getPaths();
    const matchingPaths = paths.filter(
      (p) => p.figureName === figureName && p.path.length === 2
    );

    if (matchingPaths.length === 0) {
      console.warn('[onSelectFigure] no 2-point paths found for figure.');
      return;
    }

    const ellipsePath = matchingPaths[0].path;
    const [start, end] = ellipsePath;
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const radiusX = Math.abs(end.x - start.x) / 2;
    const radiusY = Math.abs(end.y - start.y) / 2;

    const color = '#ffcc00';

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    this.drawLinesFromFigureData(
      ctx,
      ellipsePath.map((p) => ({ ...p, color })),
      figureName,
      true
    );
  }

  handleAction(action: string, data: ToolContext, figureName: string): void {
    const ctx = data.canvas?.getContext('2d');
    if (!ctx) return;

    const path = this.pointsService
      .getPointsByFigure(figureName)
      .map((p) => ({ x: p.x, y: p.y }));

    const color = this.figuresService.getFigureColorByName(figureName);

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
        this.makeCircle(ctx, path, color, figureName);
        break;
      }
    }
  }

  drawRadius(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string,
    drawVertical: boolean = false,
    isPreview: boolean = false,
    isCircle: boolean = false
  ): void {
    if (path.length !== 2) return;

    if (isCircle) {
      const radiusX = Math.abs(path[0].x - path[1].x) / 2;
      const radiusY = Math.abs(path[0].y - path[1].y) / 2;

      if (radiusX !== radiusY) {
        const newPath = this.makeCircle(ctx, path, color, figureName);
        if (newPath) {
          path = newPath;
        }
      }
    }

    const centerX = (path[0].x + path[1].x) / 2;
    const centerY = (path[0].y + path[1].y) / 2;

    const radiusXFinal = Math.abs(path[0].x - path[1].x) / 2;
    const radiusYFinal = Math.abs(path[0].y - path[1].y) / 2;

    const edgePoint = drawVertical
      ? { x: centerX, y: centerY - radiusYFinal }
      : { x: centerX + radiusXFinal, y: centerY };

    ctx.strokeStyle = color ?? '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(edgePoint.x, edgePoint.y);
    ctx.stroke();

    if (isPreview) return;

    const labelA = this.pointsService.addPoint(
      centerX,
      centerY,
      figureName,
      drawVertical ? 2 : 0
    );
    drawLabel(ctx, labelA, centerX, centerY);

    const labelB = this.pointsService.addPoint(
      edgePoint.x,
      edgePoint.y,
      figureName,
      drawVertical ? 3 : 0
    );
    drawLabel(ctx, labelB, edgePoint.x, edgePoint.y);

    this.linesService.createLine(labelA, labelB);

    setLineLengthToService(
      this.linesService,
      this.pointsService,
      ctx,
      labelA,
      labelB,
      '?'
    );

    const line = `${labelA}${labelB}`;

    if (!this.figureElementsService.hasFigureElement(figureName, 'radius')) {
      this.figureElementsService.addFigureElement(figureName, 'radius', line);
    }
  }

  drawDiameter(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string,
    isPreview: boolean = false,
    isCircle: boolean = false
  ): void {
    if (path.length !== 2) return;

    if (isCircle) {
      const radiusX = Math.abs(path[0].x - path[1].x) / 2;
      const radiusY = Math.abs(path[0].y - path[1].y) / 2;

      if (radiusX !== radiusY) {
        const newPath = this.makeCircle(ctx, path, color, figureName);
        if (newPath) {
          path = newPath;
        }
      }
    }

    const firstPoint = {
      x: path[0].x,
      y: (path[0].y + path[1].y) / 2,
    };

    const secondPoint = {
      x: path[1].x,
      y: (path[0].y + path[1].y) / 2,
    };

    ctx.strokeStyle = color ?? '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    ctx.lineTo(secondPoint.x, secondPoint.y);
    ctx.stroke();

    if (isPreview) return;

    const labelA = this.pointsService.addPoint(
      firstPoint.x,
      firstPoint.y,
      figureName,
      0
    );
    drawLabel(ctx, labelA, firstPoint.x, firstPoint.y);

    const labelB = this.pointsService.addPoint(
      secondPoint.x,
      secondPoint.y,
      figureName,
      1
    );
    drawLabel(ctx, labelB, secondPoint.x, secondPoint.y);

    this.linesService.createLine(labelA, labelB);

    setLineLengthToService(
      this.linesService,
      this.pointsService,
      ctx,
      labelA,
      labelB,
      '?'
    );

    const line = `${labelA}${labelB}`;

    if (!this.figureElementsService.hasFigureElement(figureName, 'diameter')) {
      this.figureElementsService.addFigureElement(figureName, 'diameter', line);
    }
  }

  makeCircle(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string
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

    if (figureName) {
      this.stackService.updateFigurePath(figureName, [newStart, newEnd]);
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
