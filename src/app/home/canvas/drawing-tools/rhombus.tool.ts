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
import { AnglesService } from '../services/angles.service';
import { LinesService } from '../services/lines.service';
import { FigureElementsService } from '../services/figure-elements.service';
import { FiguresService } from '../services/figures.service';

export class Rhombus implements DrawingTool {
  private start: { x: number; y: number; color: string } | null = null;
  private end: { x: number; y: number; color: string } | null = null;
  private isDrawing: boolean = false;
  private figureName: string = '';

  constructor(
    private canvasService: CanvasService,
    private pointsService: PointsService,
    private linesService: LinesService,
    private anglesService: AnglesService,
    private figureElementsService: FigureElementsService,
    private figuresService: FiguresService,
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
      this.linesService.createLine(label1, label2);
      this.linesService.createLine(label2, label3);
      this.linesService.createLine(label3, label4);
      this.linesService.createLine(label1, label4);
      restoreLineLengthToService(
        this.linesService,
        this.pointsService,
        ctx,
        label1,
        label2
      );
      restoreLineLengthToService(
        this.linesService,
        this.pointsService,
        ctx,
        label2,
        label3
      );
      restoreLineLengthToService(
        this.linesService,
        this.pointsService,
        ctx,
        label3,
        label4
      );
      restoreLineLengthToService(
        this.linesService,
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

    if (dx <= 25 && dy <= 25) {
      this.isDrawing = false;
      this.start = null;
      this.end = null;
      clearPreviewCanvas(data);
      return;
    }

    this.end = { x: pos.x, y: pos.y, color: data.selectedColor };
    const path = this.calculateRhombusPath(this.start, this.end);
    const ctx = data.canvas?.getContext('2d');
    if (ctx) this.draw(ctx, path, data.selectedColor);

    if (ctx) {
      this.figureName = '';
      const [label1, label2, label3, label4] = this.addPointsToCanvasService(
        ctx,
        path
      );
      this.linesService.createLine(label1, label2);
      this.linesService.createLine(label2, label3);
      this.linesService.createLine(label3, label4);
      this.linesService.createLine(label1, label4);
      setLineLengthToService(
        this.linesService,
        this.pointsService,
        ctx,
        label1,
        label2,
        '?'
      );
      setLineLengthToService(
        this.linesService,
        this.pointsService,
        ctx,
        label2,
        label3,
        '?'
      );
      setLineLengthToService(
        this.linesService,
        this.pointsService,
        ctx,
        label3,
        label4,
        '?'
      );
      setLineLengthToService(
        this.linesService,
        this.pointsService,
        ctx,
        label1,
        label4,
        '?'
      );
    }

    clearPreviewCanvas(data);

    this.start = null;
    this.end = null;
    this.isDrawing = false;

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

    const path = this.pointsService
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

    const path = this.calculateRhombusPath(this.start, this.end);

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

  private calculateRhombusPath(
    start: { x: number; y: number; color: string },
    end: { x: number; y: number; color: string }
  ) {
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;

    return [
      { x: centerX, y: start.y, color: start.color },
      { x: end.x, y: centerY, color: start.color },
      { x: centerX, y: end.y, color: start.color },
      { x: start.x, y: centerY, color: start.color },
    ];
  }

  private addPointsToCanvasService(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[]
  ): [string, string, string, string] {
    if (!(this.figureName.length > 1)) {
      this.figureName = this.counterService.getNextFigureName('Rhombus');
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
