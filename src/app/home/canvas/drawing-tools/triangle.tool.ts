import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { toTransparentColor } from '../utils/preview-color';
import { drawLabel } from '../tools/draw-point-label';
import {
  restoreLineLengthToService,
  setLineLengthToService,
} from '../utils/line-length.utils';
import { clearPreviewCanvas } from '../tools/clear-preview';
import { drawFigureAngles } from '../utils/angle.utils';
import { CanvasServiceInterface } from '../interfaces/canvas-service.interface';
import { PointsServiceInterface } from '../interfaces/points-service.interface';
import { LinesServiceInterface } from '../interfaces/lines-service.interface';
import { AnglesServiceInterface } from '../interfaces/angles-service.interface';
import { FigureElementsServiceInterface } from '../interfaces/figure-elements-service.interface';
import { FiguresServiceInterface } from '../interfaces/figures-service.interface';
import { CounterServiceInterface } from '../interfaces/counter-service.interface';
import { LineLength } from './types/line-length.type';

export class Triangle implements DrawingTool {
  private path: { x: number; y: number; color: string }[] = [];
  private isDrawing: boolean = false;
  private end: { x: number; y: number } | null = null;

  constructor(
    private canvasService: CanvasServiceInterface,
    private pointsService: PointsServiceInterface,
    private linesService: LinesServiceInterface,
    private anglesService: AnglesServiceInterface,
    private figureElementsService: FigureElementsServiceInterface,
    private figuresService: FiguresServiceInterface,
    private counterService: CounterServiceInterface
  ) {}

  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[],
    color: string,
    redraw: boolean = false
  ): void {
    const drawPath = path ?? this.path;
    if (drawPath.length === 3) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(drawPath[0].x, drawPath[0].y);
      ctx.lineTo(drawPath[1].x, drawPath[1].y);
      ctx.lineTo(drawPath[2].x, drawPath[2].y);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = color;
      for (const point of drawPath) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    if (redraw) {
      const figureName = this.figuresService.getFigureNameByCoords({
        x: path[0].x,
        y: path[0].y,
      });

      if (!figureName) return;

      const [label1, label2, label3] = this.addPointsToCanvasService(
        ctx,
        figureName,
        path
      );
      this.linesService.createLine(label1, label2);
      this.linesService.createLine(label2, label3);
      this.linesService.createLine(label1, label3);

      const lines = [
        { p1: path[0], p2: path[1], labelA: label1, labelB: label2 },
        { p1: path[1], p2: path[2], labelA: label2, labelB: label3 },
        { p1: path[0], p2: path[2], labelA: label1, labelB: label3 },
      ];
      this.drawLinesLength(ctx, lines);

      if (redraw && figureName) {
        this.drawLinesFromFigureData(ctx, path, figureName);
      }
    }
  }

  private drawLinesFromFigureData(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number; color: string }[],
    figureName: string,
    isPreview: boolean = false
  ): void {
    const hasHeight = this.figureElementsService.hasFigureElement(
      figureName,
      'height'
    );
    const hasMedian = this.figureElementsService.hasFigureElement(
      figureName,
      'median'
    );

    const labelA = this.anglesService.getAngleLabelByCoords(path[0]);
    const labelB = this.anglesService.getAngleLabelByCoords(path[1]);
    const labelC = this.anglesService.getAngleLabelByCoords(path[2]);

    const color = path[0].color ?? '#000';
    const paths = path.map((p) => ({
      x: p.x,
      y: p.y,
    }));

    if (hasHeight) {
      this.drawHeight(ctx, paths, color, figureName, isPreview);
    }

    if (hasMedian) {
      this.drawMedian(ctx, paths, color, figureName, hasHeight, isPreview);
    }

    if (labelA && labelB && labelC) {
      this.markAngles(ctx, paths, true);
      drawFigureAngles(ctx, this.anglesService, this.pointsService, paths, 3);
    }
  }

  private drawLinesLength(
    ctx: CanvasRenderingContext2D,
    lines: {
      p1: { x: number; y: number };
      p2: { x: number; y: number };
      labelA: string;
      labelB: string;
    }[],
    length?: LineLength
  ): void {
    const offsetMagnitude = 20;
    const allPoints: { x: number; y: number }[] = [];

    for (const line of lines) {
      allPoints.push(line.p1, line.p2);
    }

    const uniquePoints = allPoints.filter(
      (p, i, arr) => arr.findIndex((q) => q.x === p.x && q.y === p.y) === i
    );

    for (let i = 0; i < lines.length; i++) {
      const { p1, p2, labelA, labelB } = lines[i];

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      const thirdPoint = uniquePoints.find(
        (pt) =>
          (pt.x !== p1.x || pt.y !== p1.y) && (pt.x !== p2.x || pt.y !== p2.y)
      );

      let offsetX = 0;
      let offsetY = -10;

      if (thirdPoint) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const lengthVec = Math.sqrt(dx * dx + dy * dy) || 1;

        const nx = -dy / lengthVec;
        const ny = dx / lengthVec;

        const toThirdX = thirdPoint.x - midX;
        const toThirdY = thirdPoint.y - midY;

        const dot = toThirdX * nx + toThirdY * ny;
        const scale = dot < 0 ? 1 : -1;

        offsetX = nx * offsetMagnitude * scale;
        offsetY = ny * offsetMagnitude * scale;
      }

      if (length !== undefined) {
        setLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          labelA,
          labelB,
          length,
          offsetX,
          offsetY
        );
      } else {
        restoreLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          labelA,
          labelB,
          offsetX,
          offsetY
        );
      }
    }
  }

  onMouseDown(pos: { x: number; y: number }, data: ToolContext): void {
    if (this.path.length < 3) {
      if (this.isNearExistingPoint(pos)) {
        this.path = [];
        clearPreviewCanvas(data);
        return;
      }

      this.path.push({ x: pos.x, y: pos.y, color: data.selectedColor });
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
    if (this.isDrawing && this.path.length === 1) {
      this.renderPreview(data);
    } else if (this.isDrawing && this.path.length === 2) {
      this.renderPreview(data);
    } else if (this.isDrawing && this.path.length === 3) {
      if (
        this.arePointsTooClose(this.path) ||
        this.isAnyPointNearOppositeSide(this.path)
      ) {
        this.path = [];
        clearPreviewCanvas(data);
        return;
      }

      const savePath = [...this.path];
      let figureName = '';
      const ctx = data.canvas?.getContext('2d');
      if (ctx) {
        figureName = this.counterService.getNextFigureName('Triangle');
        if (!figureName) return;
        const [label1, label2, label3] = this.addPointsToCanvasService(
          ctx,
          figureName
        );
        this.linesService.createLine(label1, label2);
        this.linesService.createLine(label2, label3);
        this.linesService.createLine(label1, label3);

        this.drawLinesLength(
          ctx,
          [
            {
              p1: this.path[0],
              p2: this.path[1],
              labelA: label1,
              labelB: label2,
            },
            {
              p1: this.path[1],
              p2: this.path[2],
              labelA: label2,
              labelB: label3,
            },
            {
              p1: this.path[0],
              p2: this.path[2],
              labelA: label1,
              labelB: label3,
            },
          ],
          '?'
        );
      }

      this.path = [];
      this.isDrawing = false;
      this.end = null;

      if (ctx) this.draw(ctx, savePath, data.selectedColor);

      const previewCtx = data.previewCanvas?.getContext('2d');
      if (previewCtx)
        previewCtx.clearRect(
          0,
          0,
          data.previewCanvas.width,
          data.previewCanvas.height
        );

      return { tool: this, path: savePath, figureName: figureName };
    }
  }

  onMouseLeave(data: ToolContext): void {
    if (!this.isDrawing) return;

    this.isDrawing = false;
    this.path = [];
    this.end = null;

    if (data.previewCanvas) {
      const previewCtx = data.previewCanvas.getContext('2d');
      previewCtx?.clearRect(
        0,
        0,
        data.previewCanvas.width,
        data.previewCanvas.height
      );
    }
  }

  private isNearExistingPoint(pos: { x: number; y: number }): boolean {
    return this.path.some(
      (point) => Math.hypot(point.x - pos.x, point.y - pos.y) < 30
    );
  }

  private arePointsTooClose(points: { x: number; y: number }[]): boolean {
    const minDistance = 30;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = Math.hypot(
          points[i].x - points[j].x,
          points[i].y - points[j].y
        );
        if (dist < minDistance) return true;
      }
    }
    return false;
  }

  private isAnyPointNearOppositeSide(
    points: { x: number; y: number }[]
  ): boolean {
    const minDistance = 30;

    const getDistance = (p: any, a: any, b: any) => {
      const A = p.x - a.x;
      const B = p.y - a.y;
      const C = b.x - a.x;
      const D = b.y - a.y;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      const param = lenSq !== 0 ? dot / lenSq : -1;

      let xx, yy;

      if (param < 0) {
        xx = a.x;
        yy = a.y;
      } else if (param > 1) {
        xx = b.x;
        yy = b.y;
      } else {
        xx = a.x + param * C;
        yy = a.y + param * D;
      }

      const dx = p.x - xx;
      const dy = p.y - yy;
      return Math.hypot(dx, dy);
    };

    const [A, B, C] = points;
    return (
      getDistance(A, B, C) < minDistance ||
      getDistance(B, A, C) < minDistance ||
      getDistance(C, A, B) < minDistance
    );
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

    const drawPath = path.slice(0, 3);

    if (drawPath.length === 3) {
      const color = '#ffcc00';

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(drawPath[0].x, drawPath[0].y);
      ctx.lineTo(drawPath[1].x, drawPath[1].y);
      ctx.lineTo(drawPath[2].x, drawPath[2].y);
      ctx.closePath();
      ctx.stroke();

      for (const point of drawPath) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
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

    const fullPath = this.pointsService
      .getPointsByFigure(figureName)
      .map((p) => ({ x: p.x, y: p.y }));

    const path = fullPath.slice(0, 3);

    const color = this.figuresService.getFigureColorByName(figureName);

    switch (action) {
      case 'drawHeight': {
        this.drawHeight(ctx, path, color, figureName);
        break;
      }
      case 'drawMedian': {
        this.drawMedian(ctx, path, color, figureName);
        break;
      }
      case 'markAngles': {
        this.markAngles(ctx, path);
        break;
      }
    }
  }

  drawHeight(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string,
    isPreview: boolean = false
  ): void {
    if (path.length > 3) {
      path = path.slice(0, 3);
    }
    if (path.length < 3) {
      console.warn('[drawHeight] path length < 3');
    }

    const topIndex = path.reduce(
      (minIdx, p, i, arr) => (p.y < arr[minIdx].y ? i : minIdx),
      0
    );
    const topPoint = path[topIndex];
    const basePoints = path.filter((_, i) => i !== topIndex);
    const [A, B] = basePoints;

    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      console.warn('[drawHeight] base length is zero (A and B coincide).');
      return;
    }

    const t =
      ((topPoint.x - A.x) * dx + (topPoint.y - A.y) * dy) / lengthSquared;

    if (isNaN(t)) {
      console.warn('[drawHeight] computed t is NaN.');
      return;
    }

    if (t < 0 || t > 1) {
      console.warn(
        'Projection of altitude falls outside base — height drawing canceled.'
      );
      return;
    }

    const clampedT = Math.max(0, Math.min(1, t));

    const foot = {
      x: A.x + clampedT * dx,
      y: A.y + clampedT * dy,
    };

    ctx.strokeStyle = isPreview ? '#ffcc00' : color ? color : '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(topPoint.x, topPoint.y);
    ctx.lineTo(foot.x, foot.y);
    ctx.stroke();

    if (isPreview) {
      return;
    }

    let labelA = this.pointsService.getPointLabelByCoords(topPoint);
    if (!labelA) {
      labelA = this.pointsService.addPoint(
        topPoint.x,
        topPoint.y,
        figureName,
        0
      );
    }

    let labelB = this.pointsService.getPointLabelByCoords(foot);
    if (!labelB) {
      labelB = this.pointsService.addPoint(foot.x, foot.y, figureName, 4);
    }

    if (!(labelA && labelB)) {
      console.warn('[drawHeight] missing labels:', { labelA, labelB });
      return;
    }

    drawLabel(ctx, labelB, foot.x, foot.y);

    const line = `${labelA}${labelB}`;

    if (!this.linesService.hasLine(line)) {
      this.linesService.createLine(labelA, labelB);
      setLineLengthToService(
        this.linesService,
        this.pointsService,
        ctx,
        labelA,
        labelB,
        '?'
      );
    } else {
      restoreLineLengthToService(
        this.linesService,
        this.pointsService,
        ctx,
        labelA,
        labelB
      );
    }

    if (!this.figureElementsService.hasFigureElement(figureName, 'height')) {
      this.figureElementsService.addFigureElement(figureName, 'height', line);
    }
  }

  drawMedian(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string,
    hasHeight: boolean = false,
    isPreview: boolean = false
  ): void {
    if (path.length > 3) {
      path = path.slice(0, 3);
    }
    if (path.length < 3) {
      console.warn('[drawMedian] path length < 3');
    }

    let vertexIndex = 0;
    if (hasHeight) {
      const topY = Math.min(...path.map((pt) => pt.y));
      const topIndex = path.findIndex((p) => p.y === topY);
      vertexIndex = (topIndex + 1) % 3;
    }

    const vertex = path[vertexIndex];
    const basePoints = path.filter((_, i) => i !== vertexIndex);
    const [A, B] = basePoints;

    const midPoint = {
      x: (A.x + B.x) / 2,
      y: (A.y + B.y) / 2,
    };

    ctx.strokeStyle = isPreview ? '#ffcc00' : color ? color : '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(vertex.x, vertex.y);
    ctx.lineTo(midPoint.x, midPoint.y);
    ctx.stroke();

    if (isPreview) {
      return;
    }

    const labelA = this.pointsService.getPointLabelByCoords(vertex);

    let labelB = this.pointsService.getPointLabelByCoords(midPoint);
    if (labelB && !this.pointsService.isPointAt(labelB, midPoint)) {
      this.pointsService.removePoint(labelB);
      labelB = null;
    }

    if (!labelB) {
      labelB = this.pointsService.addPoint(
        midPoint.x,
        midPoint.y,
        figureName,
        5
      );
    }

    if (!(labelA && labelB)) {
      console.warn('[drawMedian] missing labels:', { labelA, labelB });
      return;
    }

    drawLabel(ctx, labelB, midPoint.x, midPoint.y);

    const lineKey = `${labelA}${labelB}`;

    if (!this.linesService.hasLine(lineKey)) {
      this.linesService.createLine(labelA, labelB);
      setLineLengthToService(
        this.linesService,
        this.pointsService,
        ctx,
        labelA,
        labelB,
        '?'
      );
    } else {
      restoreLineLengthToService(
        this.linesService,
        this.pointsService,
        ctx,
        labelA,
        labelB
      );
    }

    if (!this.figureElementsService.hasFigureElement(figureName, 'median')) {
      this.figureElementsService.removeFigureElement(figureName, 'median');
    }

    this.figureElementsService.addFigureElement(figureName, 'median', lineKey);
  }

  markAngles(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    isPreview: boolean = false,
    index?: number
  ): void {
    if (path.length > 3) {
      path = path.slice(0, 3);
    }
    if (path.length < 3) {
      console.warn('[markAngles] path length < 3');
    }

    const angles: {
      vertex: { x: number; y: number };
      points: [{ x: number; y: number }, { x: number; y: number }];
    }[] = [
      { vertex: path[0], points: [path[1], path[2]] },
      { vertex: path[1], points: [path[0], path[2]] },
      { vertex: path[2], points: [path[0], path[1]] },
    ];

    ctx.lineWidth = 1;

    const drawAngle = (index: number) => {
      const { vertex, points } = angles[index];
      const [p1, p2] = points;

      const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
      const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };

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
          this.anglesService.setAngleValue(label, '?');
        }
      }
    };

    if (index !== undefined && index >= 0 && index < angles.length) {
      drawAngle(index);
    } else {
      for (let i = 0; i < angles.length; i++) {
        drawAngle(i);
      }
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
      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      ctx.lineTo(this.path[1].x, this.path[1].y);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.moveTo(this.path[1].x, this.path[1].y);
      ctx.lineTo(this.end.x, this.end.y);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      ctx.lineTo(this.end.x, this.end.y);
      ctx.stroke();
      ctx.closePath();
    }

    if (this.path.length === 3) {
      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      ctx.lineTo(this.path[1].x, this.path[1].y);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.moveTo(this.path[1].x, this.path[1].y);
      ctx.lineTo(this.path[2].x, this.path[2].y);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.moveTo(this.path[2].x, this.path[2].y);
      ctx.lineTo(this.path[0].x, this.path[0].y);
      ctx.stroke();
      ctx.closePath();
    }
  }

  private addPointsToCanvasService(
    ctx: CanvasRenderingContext2D,
    figureName: string,
    path?: { x: number; y: number }[]
  ): [string, string, string] {
    if (!(figureName.length > 1)) {
      figureName = this.counterService.getNextFigureName('Triangle');
    }

    const labels: string[] = [];
    const usedPath = path ?? this.path;

    const center = usedPath.reduce(
      (acc, point) => {
        acc.x += point.x;
        acc.y += point.y;
        return acc;
      },
      { x: 0, y: 0 }
    );
    center.x /= usedPath.length;
    center.y /= usedPath.length;

    usedPath.forEach((point, index) => {
      const label = this.pointsService.addPoint(
        point.x,
        point.y,
        figureName,
        index
      );

      const dx = point.x - center.x;
      const dy = point.y - center.y;

      const offsetX = dx >= 0 ? 20 : -30;
      const offsetY = dy >= 0 ? 20 : -20;

      drawLabel(ctx, label, point.x, point.y, offsetX, offsetY);
      labels.push(label);
    });

    return [labels[0], labels[1], labels[2]];
  }
}
