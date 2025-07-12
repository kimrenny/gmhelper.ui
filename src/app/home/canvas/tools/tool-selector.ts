import { DrawingTool } from '../interfaces/drawing-tool.interface';

export class ToolSelector {
  constructor(
    private tools: Record<
      string,
      DrawingTool | ((...args: any[]) => DrawingTool)
    >
  ) {}

  select(toolName: string, ...args: any[]): DrawingTool | null {
    const tool = this.tools[toolName];

    if (!tool) return null;

    if (typeof tool === 'function') {
      return tool(...args);
    }

    return tool;
  }
}
