import { DrawingTool } from './drawing-tool.interface';

export interface ToolContext {
  canvas: HTMLCanvasElement;
  previewCanvas: HTMLCanvasElement;
  scale: number;
  paths: {
    tool: DrawingTool;
    path: { x: number; y: number; color: string }[];
  }[];
  selectedColor: string;
  redraw: () => void;
}
