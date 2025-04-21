import { DrawingTool } from '../drawing-tools/drawing-tool.interface';

export class ToolSelector {
  constructor(private tools: Record<string, DrawingTool>) {}

  select(toolName: string): DrawingTool | null {
    return this.tools[toolName] ?? null;
  }
}
