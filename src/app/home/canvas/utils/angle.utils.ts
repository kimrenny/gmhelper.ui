import { LineLength } from '../drawing-tools/types/line-length.type';
import { AnglesService } from '../services/angles.service';
import { CanvasService } from '../services/canvas.service';
import { PointsService } from '../services/points.service';

export function drawFigureAngles(
  ctx: CanvasRenderingContext2D,
  anglesService: AnglesService,
  pointsService: PointsService,
  path: { x: number; y: number }[],
  angleCount: number,
  fontsize: number = 14,
  color: string = 'black'
) {
  if (path.length !== angleCount) return;

  const center = path.reduce(
    (acc, p) => ({
      x: acc.x + p.x / angleCount,
      y: acc.y + p.y / angleCount,
    }),
    { x: 0, y: 0 }
  );

  for (let i = 0; i < angleCount; i++) {
    const vertex = path[i];

    const dx = vertex.x - center.x;
    const dy = vertex.y - center.y;

    const distanceToCenter = Math.hypot(dx, dy);

    const factor = getDynamicFactor(distanceToCenter);

    const pos = {
      x: center.x + dx * factor,
      y: center.y + dy * factor,
    };

    const label = pointsService.getPointLabelByCoords(vertex);
    if (!label) continue;

    const angleValue = anglesService.getAngleValue(label);

    drawAngleValue(ctx, pos, angleValue, fontsize, color);
  }
}

function getDynamicFactor(distance: number): number {
  if (distance < 40) return 0.65;
  if (distance < 60) return 0.7;
  if (distance < 100) return 0.75;
  if (distance < 180) return 0.8;
  if (distance < 250) return 0.82;
  if (distance < 300) return 0.85;
  return 0.9;
}

function drawAngleValue(
  ctx: CanvasRenderingContext2D,
  position: { x: number; y: number },
  angleValue: LineLength,
  fontsize: number = 14,
  color: string = 'black'
) {
  if (!angleValue) angleValue = '?';

  let value =
    typeof angleValue === 'number' ? angleValue.toString() + '°' : angleValue;

  ctx.save();
  ctx.font = `${fontsize}px Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(value, position.x, position.y);
}
