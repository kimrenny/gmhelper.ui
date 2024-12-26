export interface DrawingTool {
  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
  ): void;
}
