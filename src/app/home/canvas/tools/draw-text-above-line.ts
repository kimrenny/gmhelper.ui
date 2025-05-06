export function drawTextAboveLine(
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number },
  length: number | null | string,
  offsetX: number = 0,
  offsetY: number = -10,
  fontsize: number = 14,
  color: string = 'black'
) {
  if (!length) {
    length = '';
  }
  if (typeof length === 'number') {
    length = length.toFixed(0);
  }

  const centerX = (start.x + end.x) / 2 + offsetX;
  const centerY = (start.y + end.y) / 2 + offsetY;

  ctx.save();
  ctx.font = `${fontsize}px Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(length, centerX, centerY);
  ctx.restore();
}
