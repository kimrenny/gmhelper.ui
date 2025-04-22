import { ToolContext } from './tool-context.interface';

export interface DrawingTool {
  draw(
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    color: string
  ): void;

  onMouseDown?(event: MouseEvent, data: ToolContext): void;
  onMouseMove?(event: MouseEvent, data: ToolContext): void;
  onMouseUp?(event: MouseEvent, data: ToolContext): void;
  onMouseLeave?(event: MouseEvent, data: ToolContext): void;
}
