import { LineLength } from '../drawing-tools/types/line-length.type';
import { LinesService } from '../services/lines.service';
import { PointsService } from '../services/points.service';
import { drawTextAboveLine } from '../tools/draw-text-above-line';

export function setLineLengthToService(
  linesService: LinesService,
  pointsService: PointsService,
  ctx: CanvasRenderingContext2D,
  a: string,
  b: string,
  length: LineLength,
  offsetX: number = 0,
  offsetY: number = -10,
  fontsize: number = 14,
  color: string = 'black'
) {
  linesService.setLineLength(a, b, length);

  const pointA = pointsService.getPointByLabel(a);
  const pointB = pointsService.getPointByLabel(b);

  if (!pointA || !pointB) return;

  if (!ctx) return;

  drawTextAboveLine(
    ctx,
    pointA,
    pointB,
    length,
    offsetX,
    offsetY,
    fontsize,
    color
  );
}

export function restoreLineLengthToService(
  linesService: LinesService,
  pointsService: PointsService,
  ctx: CanvasRenderingContext2D,
  a: string,
  b: string,
  offsetX: number = 0,
  offsetY: number = -10,
  fontsize: number = 14,
  color: string = 'black'
) {
  const length = linesService.getLineLength(a, b);

  const pointA = pointsService.getPointByLabel(a);
  const pointB = pointsService.getPointByLabel(b);

  if (!pointA || !pointB) return;

  if (!ctx) return;

  drawTextAboveLine(
    ctx,
    pointA,
    pointB,
    length,
    offsetX,
    offsetY,
    fontsize,
    color
  );
}
