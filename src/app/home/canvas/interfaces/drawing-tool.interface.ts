import { ToolContext } from './tool-context.interface';

export interface DrawingTool {
  draw(
    ctx: CanvasRenderingContext2D,
    path: any,
    color: string,
    redraw: boolean
  ): void;

  onMouseDown?(pos: { x: number; y: number }, data: ToolContext): void;
  onMouseMove?(pos: { x: number; y: number }, data: ToolContext): void;
  onMouseUp?(pos: { x: number; y: number }, data: ToolContext): any;
  onMouseLeave?(pos: { x: number; y: number }, data: ToolContext): any;

  onPointClick?(pos: { x: number; y: number }, data: ToolContext): void;
  onSelectLine?(
    start: { x: number; y: number },
    end: { x: number; y: number },
    previewCanvas: HTMLCanvasElement
  ): void;
  onSelectFigure?(
    path: { x: number; y: number }[],
    previewCanvas: HTMLCanvasElement
  ): void;

  handleAction?(
    action: string,
    data: ToolContext,
    figureName?: string | null
  ): void;
}
