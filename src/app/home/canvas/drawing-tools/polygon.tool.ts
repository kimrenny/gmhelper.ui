import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { toTransparentColor } from '../utils/preview-color';
import { CanvasService } from '../services/canvas.service';
import { CounterService } from '../services/counter.service';
import { drawLabel } from '../tools/draw-point-label';
import { clearPreviewCanvas } from '../tools/clear-preview';
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
import { drawFigureAngles } from '../utils/angle.utils';
import { StackService } from '../services/stack.service';

export class Polygon implements DrawingTool {
  private center: { x: number; y: number } | null = null;
  private radius: number = 0;
  private sides: number;
  private isDrawing: boolean = false;
  private path: { x: number; y: number; color: string }[] = [];
  private figureName: string = '';

  constructor(
    sides: number,
    private canvasService: CanvasService,
    private pointsService: PointsService,
    private linesService: LinesService,
    private anglesService: AnglesService,
    private figureElementsService: FigureElementsService,
    private stackService: StackService,
    private figuresService: FiguresService,
    private counterService: CounterService
  ) {
    if (sides < 3) {
      throw new Error('Polygon must have at least 3 sides.');
    }
    this.sides = sides;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    redraw: boolean = false
  ): void {
    const drawPath = path.map((p) => ({
      x: p.x,
      y: p.y,
      color: color ?? '#000000',
    }));

    if (drawPath.length >= 3) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(drawPath[0].x, drawPath[0].y);
      for (let i = 1; i < drawPath.length; i++) {
        ctx.lineTo(drawPath[i].x, drawPath[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = color;
      for (const point of drawPath) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }
    }

    if (redraw) {
      const figureName = this.figuresService.getFigureNameByCoords({
        x: drawPath[0].x,
        y: drawPath[0].y,
      });

      if (!figureName) return;

      const labels = this.addPointsToCanvasService(ctx, path);

      for (let i = 0; i < labels.length - 1; i++) {
        const from = labels[i];
        const to = labels[(i + 1) % labels.length];
        this.linesService.createLine(from, to);
        restoreLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          from,
          to
        );
      }

      if (labels.length > 1) {
        const from = labels[0];
        const to = labels[labels.length - 1];
        this.linesService.createLine(from, to);
        restoreLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          from,
          to
        );
      }

      this.drawLinesFromFigureData(ctx, drawPath, figureName, false, true);
    }
  }

  private drawLinesFromFigureData(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[],
    figureName: string,
    isPreview: boolean = false,
    isRedraw: boolean = false
  ): void {
    const color = path[0].color ?? '#000';
    const paths = path.map((p) => ({
      x: p.x,
      y: p.y,
    }));

    const angleLabels = path.map((point) =>
      this.anglesService.getAngleLabelByCoords(point)
    );

    const hasAllLabels = angleLabels.every((label) => !!label);

    if (hasAllLabels) {
      this.markAngles(ctx, paths, true);
      drawFigureAngles(
        ctx,
        this.anglesService,
        this.pointsService,
        paths,
        path.length
      );
    }
  }

  onMouseDown(pos: { x: number; y: number }, data: ToolContext): void {
    this.center = { x: pos.x, y: pos.y };
    this.isDrawing = true;
    this.renderPreview(data);
  }

  onMouseMove(pos: { x: number; y: number }, data: ToolContext): void {
    if (!this.isDrawing || !this.center) return;

    const dx = pos.x - this.center.x;
    const dy = pos.y - this.center.y;
    const distanceX = Math.abs(dx);
    const distanceY = Math.abs(dy);
    const minDistance = Math.min(distanceX, distanceY);

    this.radius = minDistance;

    this.path = this.calculatePolygonPoints(
      this.center.x,
      this.center.y,
      this.radius,
      this.sides,
      data.selectedColor
    );

    this.renderPreview(data);
  }

  onMouseUp(pos: { x: number; y: number }, data: ToolContext): any {
    if (!this.isDrawing) return;

    if (this.radius < 10) {
      this.isDrawing = false;
      this.path = [];
      clearPreviewCanvas(data);

      return;
    }

    const ctx = data.canvas?.getContext('2d');
    if (ctx) this.draw(ctx, this.path, data.selectedColor);

    const previewCtx = data.previewCanvas?.getContext('2d');
    if (previewCtx)
      previewCtx.clearRect(
        0,
        0,
        data.previewCanvas.width,
        data.previewCanvas.height
      );

    const savePath = [...this.path];

    if (ctx) {
      this.figureName = '';
      const labels = this.addPointsToCanvasService(ctx);

      for (let i = 0; i < labels.length - 1; i++) {
        const from = labels[i];
        const to = labels[(i + 1) % labels.length];
        this.linesService.createLine(from, to);
        setLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          from,
          to,
          '?'
        );
      }

      if (labels.length > 1) {
        const from = labels[0];
        const to = labels[labels.length - 1];
        this.linesService.createLine(from, to);
        setLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          from,
          to,
          '?'
        );
      }
    }

    this.center = null;
    this.radius = 0;
    this.isDrawing = false;
    this.path = [];

    return { tool: this, path: savePath, figureName: this.figureName };
  }

  onSelectFigure(
    path: { x: number; y: number }[],
    previewCanvas: HTMLCanvasElement
  ): void {
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const figureName = this.figuresService.getFigureNameByCoords(path[0]);

    if (!figureName) {
      console.warn('[onSelectFigure] no figure name found for coords.');
      return;
    }

    const drawPath = path;
    if (drawPath.length >= 3) {
      const color = '#ffcc00';

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(drawPath[0].x, drawPath[0].y);
      for (let i = 1; i < drawPath.length; i++) {
        ctx.lineTo(drawPath[i].x, drawPath[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = color;
      for (const point of drawPath) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }

      this.drawLinesFromFigureData(
        ctx,
        path.map((p) => ({ ...p, color: color })),
        figureName,
        true
      );
    }
  }

  onSelectAngle(
    previewCanvas: HTMLCanvasElement,
    path: { x: number; y: number }[],
    label: string,
    attachedToFigure: string,
    attachedToPoint: number
  ) {
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    this.markAngles(ctx, path, true, attachedToPoint);
  }

  handleAction(action: string, data: ToolContext, figureName: string): void {
    const ctx = data.canvas?.getContext('2d');
    if (!ctx) return;

    const path = this.pointsService
      .getPointsByFigure(figureName)
      .map((p) => ({ x: p.x, y: p.y }));

    const color = this.figuresService.getFigureColorByName(figureName);

    switch (action) {
      case 'markAngles': {
        this.markAngles(ctx, path);
        break;
      }
      case 'rotate': {
        this.rotate(ctx, path, color, figureName);
        break;
      }
      case 'rotateLabels': {
        const coloredPath = path.map((p) => ({
          x: p.x,
          y: p.y,
          color: color ?? '#000000',
        }));
        this.rotateLabels(ctx, coloredPath, figureName);
        break;
      }
    }
  }

  markAngles(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    isPreview: boolean = false,
    index?: number
  ): void {
    const n = path.length;

    if (n < 3) {
      console.warn('[markAngles] path length < 3');
      return;
    }

    const angleValue = (180 * (n - 2)) / n;

    ctx.lineWidth = 1;

    const drawAngle = (i: number) => {
      const vertex = path[i];
      const prev = path[(i - 1 + path.length) % path.length];
      const next = path[(i + 1) % path.length];

      const v1 = { x: prev.x - vertex.x, y: prev.y - vertex.y };
      const v2 = { x: next.x - vertex.x, y: next.y - vertex.y };

      const angleStart = Math.atan2(v1.y, v1.x);
      const angleEnd = Math.atan2(v2.y, v2.x);

      let deltaAngle = angleEnd - angleStart;
      if (deltaAngle < 0) {
        deltaAngle += 2 * Math.PI;
      }
      const anticlockwise = deltaAngle > Math.PI;

      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 15, angleStart, angleEnd, anticlockwise);
      ctx.stroke();

      if (!isPreview) {
        const label = this.pointsService.getPointLabelByCoords(vertex);
        if (label) {
          this.anglesService.setAngleValue(label, angleValue);
        }
      }
    };

    if (index !== undefined && index >= 0 && index < path.length) {
      drawAngle(index);
    } else {
      for (let i = 0; i < path.length; i++) {
        drawAngle(i);
      }
    }
  }

  rotate(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string
  ): void {
    if (path.length < 3) {
      console.warn('[rotate] path length < 3');
      return;
    }

    const centerX = path.reduce((sum, p) => sum + p.x, 0) / path.length;
    const centerY = path.reduce((sum, p) => sum + p.y, 0) / path.length;

    const rotatedPath = path.map((point) => {
      const dx = point.x - centerX;
      const dy = point.y - centerY;

      return {
        x: centerX - dy,
        y: centerY + dx,
        color: color ?? '#000000',
      };
    });

    if (figureName) {
      this.stackService.updateFigurePath(figureName, rotatedPath);
    }
  }

  rotateLabels(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[],
    figureName: string
  ): void {
    if (path.length < 3) {
      console.warn('[rotateLabels] path length < 3');
      return;
    }

    const newPath = [...path.slice(1), { ...path[0] }];

    if (figureName) {
      this.stackService.updateFigurePath(figureName, newPath);
    }
  }

  private renderPreview(data: ToolContext): void {
    if (!this.isDrawing || !this.center || this.radius <= 0) return;

    const ctx = data.previewCanvas?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, data.previewCanvas.width, data.previewCanvas.height);

    ctx.strokeStyle = toTransparentColor(data.selectedColor);
    ctx.lineWidth = 2;

    const previewPath = this.calculatePolygonPoints(
      this.center.x,
      this.center.y,
      this.radius,
      this.sides,
      data.selectedColor
    );

    ctx.beginPath();
    ctx.moveTo(previewPath[0].x, previewPath[0].y);
    for (let i = 1; i < previewPath.length; i++) {
      ctx.lineTo(previewPath[i].x, previewPath[i].y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  private calculatePolygonPoints(
    cx: number,
    cy: number,
    radius: number,
    sides: number,
    color: string
  ): { x: number; y: number; color: string }[] {
    const points: { x: number; y: number; color: string }[] = [];
    const angleStep = (2 * Math.PI) / sides;

    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push({ x, y, color: color });
    }

    return points;
  }

  private addPointsToCanvasService(
    ctx: CanvasRenderingContext2D,
    path?: { x: number; y: number }[]
  ): string[] {
    if (!(this.figureName.length > 1)) {
      this.figureName = this.counterService.getNextFigureName('Polygon');
    }

    const labels: string[] = [];
    const pointsToProcess = path && path.length > 0 ? path : this.path;

    if (!pointsToProcess || pointsToProcess.length === 0) {
      console.warn('Path is empty. No points to add.');
      return labels;
    }

    pointsToProcess.forEach((point, index) => {
      const label = this.pointsService.addPoint(
        point.x,
        point.y,
        this.figureName,
        index
      );

      if (!label) {
        console.error(`Label was not returned for point at index ${index}`);
      }

      drawLabel(ctx, label, point.x, point.y);
      labels.push(label);
    });

    return labels;
  }
}
