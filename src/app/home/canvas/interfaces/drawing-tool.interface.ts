import { ToolContext } from './tool-context.interface';

export interface DrawingTool {
  draw(ctx: CanvasRenderingContext2D, path: any, color: string): void;

  onMouseDown?(pos: { x: number; y: number }, data: ToolContext): void;
  onMouseMove?(pos: { x: number; y: number }, data: ToolContext): void;
  onMouseUp?(pos: { x: number; y: number }, data: ToolContext): any;
  onMouseLeave?(pos: { x: number; y: number }, data: ToolContext): any;

  onPointClick?(pos: { x: number; y: number }, data: ToolContext): void;
}
