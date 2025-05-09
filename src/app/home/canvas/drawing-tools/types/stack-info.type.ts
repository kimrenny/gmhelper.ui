import { DrawingTool } from '../../interfaces/drawing-tool.interface';

export type stackInfo = {
  tool: DrawingTool;
  path: { x: number; y: number; color: string }[];
  figureName?: string;
};
