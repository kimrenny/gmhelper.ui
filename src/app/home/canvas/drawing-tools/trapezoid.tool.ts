import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { toTransparentColor } from '../utils/preview-color';
import { drawLabel } from '../tools/draw-point-label';
import {
  restoreLineLengthToService,
  setLineLengthToService,
} from '../utils/line-length.utils';
import { drawFigureAngles } from '../utils/angle.utils';
import { CanvasServiceInterface } from '../interfaces/canvas-service.interface';
import { PointsServiceInterface } from '../interfaces/points-service.interface';
import { LinesServiceInterface } from '../interfaces/lines-service.interface';
import { AnglesServiceInterface } from '../interfaces/angles-service.interface';
import { FigureElementsServiceInterface } from '../interfaces/figure-elements-service.interface';
import { FiguresServiceInterface } from '../interfaces/figures-service.interface';
import { CounterServiceInterface } from '../interfaces/counter-service.interface';
import { LineLength } from './types/line-length.type';

export class Trapezoid implements DrawingTool {
  private path: { x: number; y: number; color: string }[] = [];
  private isDrawing: boolean = false;
  private end: { x: number; y: number; color: string } | null = null;

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
    const drawPath = path;
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

    ctx.fillStyle = color;
    for (const point of path) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    if (redraw) {
      const figureName = this.figuresService.getFigureNameByCoords({
        x: path[0].x,
        y: path[0].y,
      });

      if (!figureName) return;

      const [label1, label2, label3, label4] = this.addPointsToCanvasService(
        ctx,
        figureName,
        path
      );
      this.linesService.createLine(label1, label2);
      this.linesService.createLine(label2, label3);
      this.linesService.createLine(label3, label4);
      this.linesService.createLine(label1, label4);

      const lines = [
        { p1: path[0], p2: path[1], labelA: label1, labelB: label2 },
        { p1: path[1], p2: path[2], labelA: label2, labelB: label3 },
        { p1: path[2], p2: path[3], labelA: label3, labelB: label4 },
        { p1: path[3], p2: path[0], labelA: label4, labelB: label1 },
      ];
      this.drawLinesLength(ctx, lines);

      this.drawLinesFromFigureData(ctx, path, figureName, false, true);
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

    const hasMidLine = this.figureElementsService.hasFigureElement(
      figureName,
      'midline'
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

    if (hasMidLine) {
      this.drawMidLine(ctx, paths, color, figureName, isPreview);
    }

    if (labelA && labelB && labelC && labelD) {
      this.markAngles(ctx, paths, true);
      drawFigureAngles(ctx, this.anglesService, this.pointsService, paths, 4);
    }
  }

  drawLinesLength(
    ctx: CanvasRenderingContext2D,
    lines: {
      p1: { x: number; y: number };
      p2: { x: number; y: number };
      labelA: string;
      labelB: string;
    }[],
    length?: LineLength
  ): void {
    const centers = lines.map((line, i) => {
      return {
        index: i,
        midX: (line.p1.x + line.p2.x) / 2,
        midY: (line.p1.y + line.p2.y) / 2,
      };
    });

    const topLine = centers.reduce((min, cur) =>
      cur.midY < min.midY ? cur : min
    );
    const bottomLine = centers.reduce((max, cur) =>
      cur.midY > max.midY ? cur : max
    );
    const leftLine = centers.reduce((min, cur) =>
      cur.midX < min.midX ? cur : min
    );
    const rightLine = centers.reduce((max, cur) =>
      cur.midX > max.midX ? cur : max
    );

    for (let i = 0; i < lines.length; i++) {
      let offsetX = 0;
      let offsetY = -15;

      if (i === topLine.index) {
        offsetX = 0;
        offsetY = -15;
      } else if (i === bottomLine.index) {
        offsetX = 0;
        offsetY = 20;
      } else if (i === leftLine.index) {
        offsetX = -15;
        offsetY = 0;
      } else if (i === rightLine.index) {
        offsetX = 15;
        offsetY = 0;
      }

      const { labelA, labelB } = lines[i];

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
    if (this.path.length < 4) {
      this.path.push({ x: pos.x, y: pos.y, color: data.selectedColor });
      this.isDrawing = true;
      this.renderPreview(data);
    }
  }

  onMouseMove(pos: { x: number; y: number }, data: ToolContext): void {
    if (this.isDrawing) {
      this.end = { x: pos.x, y: pos.y, color: data.selectedColor };
      this.renderPreview(data);
    }
  }

  onMouseUp(pos: { x: number; y: number }, data: ToolContext): any {
    if (!this.isDrawing) return;

    if (this.path.length < 4) {
      this.renderPreview(data);
    } else if (this.path.length === 4) {
      const [p1, p2, p3, p4] = this.path;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;

      const length = Math.sqrt(dx * dx + dy * dy);
      if (length === 0) return;

      const unitDx = dx / length;
      const unitDy = dy / length;

      const dxMouse = p4.x - p3.x;
      const dyMouse = p4.y - p3.y;

      const projection = dxMouse * unitDx + dyMouse * unitDy;

      const correctedFourthPoint = {
        x: p3.x + unitDx * projection,
        y: p3.y + unitDy * projection,
        color: data.selectedColor,
      };

      this.path[3] = correctedFourthPoint;

      const savePath = [...this.path];

      const ctx = data.canvas?.getContext('2d');

      let figureName = '';
      if (ctx) {
        figureName = this.counterService.getNextFigureName('Trapezoid');
        if (!figureName) return;

        const [label1, label2, label3, label4] = this.addPointsToCanvasService(
          ctx,
          figureName,
          this.path
        );
        this.linesService.createLine(label1, label2);
        this.linesService.createLine(label2, label3);
        this.linesService.createLine(label3, label4);
        this.linesService.createLine(label1, label4);

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
              p1: this.path[2],
              p2: this.path[3],
              labelA: label3,
              labelB: label4,
            },
            {
              p1: this.path[3],
              p2: this.path[0],
              labelA: label4,
              labelB: label1,
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

  onMouseLeave(data: ToolContext) {
    if (!this.isDrawing) return;

    this.path = [];
    this.end = null;
    this.isDrawing = false;

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

    const drawPath = path.slice(0, 4);

    if (drawPath.length === 4) {
      const color = '#ffcc00';

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
      for (const point of path) {
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

    const path = fullPath.slice(0, 4);

    const color = this.figuresService.getFigureColorByName(figureName);

    switch (action) {
      case 'drawDiagonal': {
        this.drawDiagonal(ctx, path, color, figureName);
        break;
      }
      case 'drawMidLine': {
        this.drawMidLine(ctx, path, color, figureName);
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

  drawMidLine(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string,
    isPreview: boolean = false
  ): void {
    if (path.length < 4) {
      console.warn('[drawMidline] path length < 4');
      return;
    }

    const topLeft = path[0];
    const topRight = path[1];
    const bottomRight = path[2];
    const bottomLeft = path[3];

    const mid1 = {
      x: (topLeft.x + bottomLeft.x) / 2,
      y: (topLeft.y + bottomLeft.y) / 2,
    };

    const mid2 = {
      x: (topRight.x + bottomRight.x) / 2,
      y: (topRight.y + bottomRight.y) / 2,
    };

    ctx.strokeStyle = isPreview ? '#ffcc00' : color ?? '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mid1.x, mid1.y);
    ctx.lineTo(mid2.x, mid2.y);
    ctx.stroke();

    if (isPreview) {
      return;
    }

    let labelA = this.pointsService.getPointLabelByCoords(mid1);
    if (!labelA) {
      labelA = this.pointsService.addPoint(mid1.x, mid1.y, figureName, 5);
    }

    let labelB = this.pointsService.getPointLabelByCoords(mid2);
    if (!labelB) {
      labelB = this.pointsService.addPoint(mid2.x, mid2.y, figureName, 6);
    }

    if (!(labelA && labelB)) {
      console.warn('[drawMidline] missing labels:', { labelA, labelB });
      return;
    }

    drawLabel(ctx, labelA, mid1.x, mid1.y);
    drawLabel(ctx, labelB, mid2.x, mid2.y);

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

    if (!this.figureElementsService.hasFigureElement(figureName, 'midline')) {
      this.figureElementsService.addFigureElement(figureName, 'midline', line);
    }
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
      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      ctx.lineTo(this.path[1].x, this.path[1].y);
      ctx.lineTo(this.end.x, this.end.y);
      ctx.closePath();
      ctx.stroke();
    }

    if (this.path.length === 3) {
      const [p1, p2, p3] = this.path;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;

      const length = Math.sqrt(dx * dx + dy * dy);
      if (length === 0) return;

      const unitDx = dx / length;
      const unitDy = dy / length;

      const dxMouse = this.end.x - p3.x;
      const dyMouse = this.end.y - p3.y;

      const projection = dxMouse * unitDx + dyMouse * unitDy;

      const fourthPoint = {
        x: p3.x + unitDx * projection,
        y: p3.y + unitDy * projection,
      };

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(fourthPoint.x, fourthPoint.y);
      ctx.closePath();
      ctx.stroke();
    }

    if (this.path.length === 4) {
      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      ctx.lineTo(this.path[1].x, this.path[1].y);
      ctx.lineTo(this.path[2].x, this.path[2].y);
      ctx.lineTo(this.path[3].x, this.path[3].y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  private addPointsToCanvasService(
    ctx: CanvasRenderingContext2D,
    figureName: string,
    path: { x: number; y: number }[]
  ): [string, string, string, string] {
    if (!(figureName.length > 1)) {
      figureName = this.counterService.getNextFigureName('Trapezoid');
    }

    const labels: string[] = [];

    const center = path.reduce(
      (acc, p) => {
        acc.x += p.x;
        acc.y += p.y;
        return acc;
      },
      { x: 0, y: 0 }
    );
    center.x /= path.length;
    center.y /= path.length;

    for (let i = 0; i < path.length; i++) {
      const point = path[i];

      const dx = center.x - point.x;
      const dy = center.y - point.y;

      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      let offsetX = 0;
      let offsetY = 0;

      if (angle >= -135 && angle < -45) {
        offsetX = 0;
        offsetY = 20;
      } else if (angle >= -45 && angle < 45) {
        offsetX = -20;
        offsetY = 0;
      } else if (angle >= 45 && angle < 135) {
        offsetX = 0;
        offsetY = -20;
      } else {
        offsetX = 20;
        offsetY = 0;
      }

      const label = this.pointsService.addPoint(
        point.x,
        point.y,
        figureName,
        i
      );

      drawLabel(ctx, label, point.x, point.y, offsetX, offsetY);

      labels.push(label);
    }

    return [labels[0], labels[1], labels[2], labels[3]];
  }
}
