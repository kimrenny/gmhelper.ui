export function drawLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  offsetX: number = 10,
  offsetY: number = -10,
  fontsize: number = 16,
  color: string = 'black'
): void {
  ctx.font = `${fontsize}px Arial`;
  ctx.fillStyle = color;
  ctx.fillText(label, x + offsetX, y + offsetY);
}
