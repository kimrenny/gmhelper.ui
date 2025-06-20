import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { CanvasService } from '../services/canvas.service';
import { CounterService } from '../services/counter.service';
import { clearPreviewCanvas } from '../tools/clear-preview';
import { toTransparentColor } from '../utils/preview-color';
import { drawLabel } from '../tools/draw-point-label';
import { drawTextAboveLine } from '../tools/draw-text-above-line';
import { LineLength } from './types/line-length.type';
import {
  restoreLineLengthToService,
  setLineLengthToService,
} from '../utils/line-length.utils';
import { PointsService } from '../services/points.service';

export class Rectangle implements DrawingTool {
  private start: { x: number; y: number; color: string } | null = null;
  private end: { x: number; y: number; color: string } | null = null;
  private isDrawing: boolean = false;
  private figureName: string = '';

  constructor(
    private canvasService: CanvasService,
    private pointsService: PointsService,
    private counterService: CounterService
  ) {}

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[],
    color: string,
    redraw: boolean = false
  ): void {
    if (path.length !== 4) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = color;
    for (const point of path) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    if (redraw) {
      const [label1, label2, label3, label4] = this.addPointsToCanvasService(
        ctx,
        path
      );
      this.canvasService.createLine(label1, label2);
      this.canvasService.createLine(label2, label3);
      this.canvasService.createLine(label3, label4);
      this.canvasService.createLine(label1, label4);
      restoreLineLengthToService(
        this.canvasService,
        this.pointsService,
        ctx,
        label1,
        label2
      );
      restoreLineLengthToService(
        this.canvasService,
        this.pointsService,
        ctx,
        label2,
        label3
      );
      restoreLineLengthToService(
        this.canvasService,
        this.pointsService,
        ctx,
        label3,
        label4
      );
      restoreLineLengthToService(
        this.canvasService,
        this.pointsService,
        ctx,
        label1,
        label4
      );
    }
  }

  onMouseDown(pos: { x: number; y: number }, data: ToolContext): void {
    this.start = { x: pos.x, y: pos.y, color: data.selectedColor };
    this.end = null;
    this.isDrawing = true;
  }

  onMouseMove(pos: { x: number; y: number }, data: ToolContext): void {
    if (!this.isDrawing || !this.start) return;

    this.end = { x: pos.x, y: pos.y, color: data.selectedColor };
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

    this.end = { x: pos.x, y: pos.y, color: data.selectedColor };
    const path = this.calculateRectPath(
      this.start,
      this.end,
      data.selectedColor
    );
    const ctx = data.canvas?.getContext('2d');

    if (ctx) {
      this.draw(ctx, path, data.selectedColor);

      this.figureName = '';
      const [label1, label2, label3, label4] = this.addPointsToCanvasService(
        ctx,
        path
      );
      this.canvasService.createLine(label1, label2);
      this.canvasService.createLine(label2, label3);
      this.canvasService.createLine(label3, label4);
      this.canvasService.createLine(label1, label4);
      setLineLengthToService(
        this.canvasService,
        this.pointsService,
        ctx,
        label1,
        label2,
        '?'
      );
      setLineLengthToService(
        this.canvasService,
        this.pointsService,
        ctx,
        label2,
        label3,
        '?',
        10
      );
      setLineLengthToService(
        this.canvasService,
        this.pointsService,
        ctx,
        label3,
        label4,
        '?'
      );
      setLineLengthToService(
        this.canvasService,
        this.pointsService,
        ctx,
        label1,
        label4,
        '?',
        -10
      );
    }

    this.start = null;
    this.end = null;
    this.isDrawing = false;
    clearPreviewCanvas(data);

    return { tool: this, path, figureName: this.figureName };
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
      return;
    }

    if (path.length !== 4) return;

    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#ffcc00';
    for (const point of path) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  handleAction(action: string, data: ToolContext, figureName: string): void {
    const ctx = data.canvas?.getContext('2d');
    if (!ctx) return;

    const path = this.canvasService
      .getPointsByFigure(figureName)
      .map((p) => ({ x: p.x, y: p.y }));

    switch (action) {
      case 'func1': {
        this.firstAction(ctx, path);
        break;
      }
      case 'func2': {
        this.secondAction(ctx, path);
        break;
      }
      case 'func3': {
        this.thirdAction(ctx, path);
        break;
      }
    }
  }

  firstAction(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[]
  ): void {}

  secondAction(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[]
  ): void {}

  thirdAction(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[]
  ): void {}

  private renderPreview(data: ToolContext): void {
    if (!this.start || !this.end) return;

    const ctx = data.previewCanvas?.getContext('2d');
    if (!ctx) return;

    const path = this.calculateRectPath(
      this.start,
      this.end,
      data.selectedColor
    );

    ctx.clearRect(0, 0, data.previewCanvas.width, data.previewCanvas.height);

    ctx.strokeStyle = toTransparentColor(data.selectedColor);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.closePath();

    ctx.stroke();
  }

  private calculateRectPath(
    start: { x: number; y: number; color: string },
    end: { x: number; y: number; color: string },
    color: string
  ) {
    return [
      { x: start.x, y: start.y, color: color },
      { x: end.x, y: start.y, color: color },
      { x: end.x, y: end.y, color: color },
      { x: start.x, y: end.y, color: color },
    ];
  }

  private addPointsToCanvasService(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[]
  ): [string, string, string, string] {
    if (!(this.figureName.length > 1)) {
      this.figureName = this.counterService.getNextFigureName('Rectangle');
    }
    const labels: string[] = [];

    path.forEach((point, index) => {
      const label = this.pointsService.addPoint(
        point.x,
        point.y,
        this.figureName,
        index
      );

      drawLabel(ctx, label, point.x, point.y);

      labels.push(label);
    });

    return [labels[0], labels[1], labels[2], labels[3]];
  }
}
