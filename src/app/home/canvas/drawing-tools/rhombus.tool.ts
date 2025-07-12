import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { ToolContext } from '../interfaces/tool-context.interface';
import { clearPreviewCanvas } from '../tools/clear-preview';
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
import { StackServiceInterface } from '../interfaces/stack-service.interface';
import { FiguresServiceInterface } from '../interfaces/figures-service.interface';
import { CounterServiceInterface } from '../interfaces/counter-service.interface';

export class Rhombus implements DrawingTool {
  private start: { x: number; y: number; color: string } | null = null;
  private end: { x: number; y: number; color: string } | null = null;
  private isDrawing: boolean = false;
  private figureName: string = '';

  constructor(
    private canvasService: CanvasServiceInterface,
    private pointsService: PointsServiceInterface,
    private linesService: LinesServiceInterface,
    private anglesService: AnglesServiceInterface,
    private figureElementsService: FigureElementsServiceInterface,
    private stackService: StackServiceInterface,
    private figuresService: FiguresServiceInterface,
    private counterService: CounterServiceInterface
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

    const figureName = this.figuresService.getFigureNameByCoords(path[0]);

    if (!figureName) {
      console.warn('[onSelectFigure] no figure name found for coords.');
      return;
    }

    const drawPath = path.slice(0, 4);

    if (drawPath.length === 4) {
      const color = '#ffcc00';

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
      case 'markAngles': {
        this.markAngles(ctx, path);
        break;
      }
      case 'rotate': {
        this.rotate(ctx, path, color, figureName);
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

  rotate(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string,
    figureName: string
  ): void {
    if (path.length !== 4) return;

    const centerX = (path[0].x + path[1].x + path[2].x + path[3].x) / 4;
    const centerY = (path[0].y + path[1].y + path[2].y + path[3].y) / 4;

    const rotatedPath = path.map((point) => {
      const dx = point.x - centerX;
      const dy = point.y - centerY;

      return {
        x: centerX - dy,
        y: centerY + dx,
        color: color ?? color ?? '#000000',
      };
    });

    if (figureName) {
      this.stackService.updateFigurePath(figureName, rotatedPath);
    }
  }

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
