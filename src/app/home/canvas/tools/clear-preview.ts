import { ToolContext } from '../interfaces/tool-context.interface';

export function clearPreviewCanvas(data: ToolContext) {
  const previewCtx = data.previewCanvas?.getContext('2d');
  if (previewCtx)
    previewCtx.clearRect(
      0,
      0,
      data.previewCanvas.width,
      data.previewCanvas.height
    );
}
