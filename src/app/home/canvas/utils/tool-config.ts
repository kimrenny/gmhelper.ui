import { Pencil } from '../drawing-tools/pencil.tool';
import { Ellipse } from '../drawing-tools/ellipse.tool';
import { Parallelogram } from '../drawing-tools/parallelogram.tool';
import { Line } from '../drawing-tools/line.tool';
import { Triangle } from '../drawing-tools/triangle.tool';
import { Rectangle } from '../drawing-tools/rectangle.tool';
import { Trapezoid } from '../drawing-tools/trapezoid.tool';
import { Rhombus } from '../drawing-tools/rhombus.tool';
import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { CanvasService } from '../services/canvas.service';
import { CounterService } from '../services/counter.service';

export function getDefaultTools(
  polygonTool: DrawingTool,
  canvasService: CanvasService,
  counterService: CounterService
) {
  return {
    pencil: new Pencil(),
    ellipse: new Ellipse(canvasService, counterService),
    parallelogram: new Parallelogram(canvasService, counterService),
    line: new Line(canvasService, counterService),
    polygon: polygonTool,
    triangle: new Triangle(canvasService, counterService),
    rectangle: new Rectangle(canvasService, counterService),
    trapezoid: new Trapezoid(canvasService, counterService),
    rhombus: new Rhombus(canvasService, counterService),
  };
}
