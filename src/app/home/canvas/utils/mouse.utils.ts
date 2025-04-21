export function getMousePos(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  scale: number
): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect();
  const scaleFactor = scale / 100;

  const x = (event.clientX - rect.left) / scaleFactor;
  const y = (event.clientY - rect.top) / scaleFactor;

  if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
    return null;
  }

  return {
    x: Math.max(0, Math.min(x, canvas.width)),
    y: Math.max(0, Math.min(y, canvas.height)),
  };
}
