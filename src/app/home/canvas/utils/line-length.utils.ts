import { LineLength } from '../drawing-tools/types/line-length.type';
import { CanvasService } from '../services/canvas.service';
import { drawTextAboveLine } from '../tools/draw-text-above-line';

export function setLineLengthToService(
  canvasService: CanvasService,
  ctx: CanvasRenderingContext2D,
  a: string,
  b: string,
  length: LineLength,
  offsetX: number = 0,
  offsetY: number = -10,
  fontsize: number = 14,
  color: string = 'black'
) {
  canvasService.setLineLength(a, b, length);

  const pointA = canvasService.getPointByLabel(a);
  const pointB = canvasService.getPointByLabel(b);

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
  canvasService: CanvasService,
  ctx: CanvasRenderingContext2D,
  a: string,
  b: string,
  offsetX: number = 0,
  offsetY: number = -10,
  fontsize: number = 14,
  color: string = 'black'
) {
  const length = canvasService.getLineLength(a, b);

  const pointA = canvasService.getPointByLabel(a);
  const pointB = canvasService.getPointByLabel(b);

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
