import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { CanvasService } from '../services/canvas.service';
import { CounterService } from '../services/counter.service';
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
import { StackService } from '../services/stack.service';
import { drawFigureAngles } from '../utils/angle.utils';

export class Parallelogram implements DrawingTool {
  private path: { x: number; y: number }[] = [];
  private isDrawing: boolean = false;
  private end: { x: number; y: number } | null = null;
  private figureName: string = '';

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
    path: { x: number; y: number }[],
    color: string,
    redraw: boolean = false
  ): void {
    const drawPath = path.map((p) => ({
      x: p.x,
      y: p.y,
      color: color ?? '#000000',
    }));

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
    const hasDiagonal = this.figureElementsService.hasFigureElement(
      figureName,
      'diagonal'
    );

    const labelA = this.anglesService.getAngleLabelByCoords(path[0]);
    const labelB = this.anglesService.getAngleLabelByCoords(path[1]);
    const labelC = this.anglesService.getAngleLabelByCoords(path[2]);
    const labelD = this.anglesService.getAngleLabelByCoords(path[3]);

    const color = path[0].color ?? '#000';
    const paths = path.map((p) => ({
      x: p.x,
      y: p.y,
    }));

    if (hasDiagonal) {
      this.drawDiagonal(ctx, paths, color, figureName, isPreview, isRedraw);
    }

    if (labelA && labelB && labelC && labelD) {
      this.markAngles(ctx, paths, true);
      drawFigureAngles(ctx, this.anglesService, this.pointsService, paths, 4);
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

      const ctx = data.canvas?.getContext('2d');
      if (ctx) {
        this.figureName = '';
        const [label1, label2, label3, label4] =
          this.addPointsToCanvasService(ctx);
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
          '?',
          0,
          -10
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

      return { tool: this, path: savePath, figureName: this.figureName };
    }
  }

  onSelectFigure(
    path: { x: number; y: number }[],
    previewCanvas: HTMLCanvasElement
  ) {
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const figureName = this.figuresService.getFigureNameByCoords(path[0]);

    if (!figureName) {
      console.warn('[onSelectFigure] no figure name found for coords.');
      return;
    }

    const drawPath = path.slice(0, 4);

    if (drawPath.length === 4) {
      const color = '#ffcc00';

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      ctx.lineTo(path[1].x, path[1].y);
      ctx.lineTo(path[2].x, path[2].y);
      ctx.lineTo(path[3].x, path[3].y);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = color;
      for (const point of path) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
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

    const fullPath = this.pointsService
      .getPointsByFigure(figureName)
      .map((p) => ({ x: p.x, y: p.y }));

    const path = fullPath.slice(0, 4);

    const color = this.figuresService.getFigureColorByName(figureName);

    switch (action) {
      case 'drawDiagonal': {
        this.drawDiagonal(ctx, path, color, figureName);
        break;
      }
      case 'makeRegular': {
        this.makeRegular(ctx, path, color, figureName);
        break;
      }
      case 'markAngles': {
        this.markAngles(ctx, path);
        break;
      }
    }
  }

  drawDiagonal(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string,
    isPreview: boolean = false,
    isRedraw: boolean = false
  ): void {
    if (path.length > 4) {
      path = path.slice(0, 4);
    }
    if (path.length < 4) {
      console.warn('[drawDiagonal] path length < 4');
      return;
    }

    const existingElements =
      this.figureElementsService.getFigureElements(figureName);
    const existingDiagonals = existingElements
      ? Array.from(existingElements)
          .filter(
            (e: { type: string; label?: string }) => e.type === 'diagonal'
          )
          .map((e) => e.label)
      : [];

    const diagonalsToCheck: [(typeof path)[0], (typeof path)[0]][] = [
      [path[0], path[2]],
      [path[1], path[3]],
    ];

    if (isPreview) {
      for (const [p1, p2] of diagonalsToCheck) {
        const label1 = this.pointsService.getPointLabelByCoords(p1);
        const label2 = this.pointsService.getPointLabelByCoords(p2);
        const line = label1 && label2 ? `${label1}${label2}` : null;
        if (line && existingDiagonals.includes(line)) {
          ctx.strokeStyle = '#ffcc00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
      return;
    }

    for (const [p1, p2] of diagonalsToCheck) {
      let label1 = this.pointsService.getPointLabelByCoords(p1);
      let label2 = this.pointsService.getPointLabelByCoords(p2);
      const line = label1 && label2 ? `${label1}${label2}` : null;
      const alreadyExists = line && existingDiagonals.includes(line);

      if (alreadyExists) {
        if (!(label1 && label2)) continue;

        ctx.strokeStyle = color ?? '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        drawLabel(ctx, label2, p2.x, p2.y);

        restoreLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          label1,
          label2
        );

        continue;
      }

      if (isRedraw) continue;

      if (!(label1 && label2)) continue;

      const newLine = `${label1}${label2}`;

      ctx.strokeStyle = color ?? '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      drawLabel(ctx, label2, p2.x, p2.y);

      if (!this.linesService.hasLine(newLine)) {
        this.linesService.createLine(label1, label2);
        setLineLengthToService(
          this.linesService,
          this.pointsService,
          ctx,
          label1,
          label2,
          '?'
        );
      }

      this.figureElementsService.addFigureElement(
        figureName,
        'diagonal',
        newLine
      );

      return;
    }
  }

  makeRegular(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string
  ): void {
    if (path.length > 4) {
      path = path.slice(0, 4);
    }
    if (path.length < 4) {
      console.warn('[makeRegular] path length < 4');
      return;
    }

    const [A, B, C] = path;

    const dist = (p1: { x: number; y: number }, p2: { x: number; y: number }) =>
      Math.hypot(p1.x - p2.x, p1.y - p2.y);

    const AB = dist(A, B);
    const BC = dist(B, C);
    const side = Math.min(AB, BC);

    const dxAB = B.x - A.x;
    const dyAB = B.y - A.y;
    const lenAB = Math.hypot(dxAB, dyAB);
    const uxAB = dxAB / lenAB;
    const uyAB = dyAB / lenAB;

    const dxBC = C.x - B.x;
    const dyBC = C.y - B.y;
    const lenBC = Math.hypot(dxBC, dyBC);
    const uxBC = dxBC / lenBC;
    const uyBC = dyBC / lenBC;

    const pointB = {
      x: A.x + side * uxAB,
      y: A.y + side * uyAB,
      color,
    };

    const pointC = {
      x: pointB.x + side * uxBC,
      y: pointB.y + side * uyBC,
      color,
    };

    const pointD = {
      x: A.x + side * uxBC,
      y: A.y + side * uyBC,
      color,
    };

    const newPath = [{ x: A.x, y: A.y, color }, pointB, pointC, pointD];

    this.stackService.updateFigurePath(figureName, newPath);
  }

  markAngles(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    isPreview: boolean = false,
    index?: number
  ): void {
    if (path.length > 4) {
      path = path.slice(0, 4);
    }
    if (path.length < 4) {
      console.warn('[markAngles] path length < 4');
    }

    const angles: {
      vertex: { x: number; y: number };
      points: [{ x: number; y: number }, { x: number; y: number }];
    }[] = [
      { vertex: path[0], points: [path[3], path[1]] },
      { vertex: path[1], points: [path[0], path[2]] },
      { vertex: path[2], points: [path[1], path[3]] },
      { vertex: path[3], points: [path[2], path[0]] },
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

  private addPointsToCanvasService(
    ctx: CanvasRenderingContext2D,
    path?: { x: number; y: number }[]
  ): [string, string, string, string] {
    if (!(this.figureName.length > 1)) {
      this.figureName = this.counterService.getNextFigureName('Parallelogram');
    }

    const labels: string[] = [];

    if (!path) {
      this.path.forEach((point, index) => {
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

    if (!(this.figureName.length > 1)) {
      this.figureName = this.counterService.getNextFigureName('Parallelogram');
    }

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
