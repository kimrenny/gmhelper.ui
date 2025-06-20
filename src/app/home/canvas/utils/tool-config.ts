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
import { PointsService } from '../services/points.service';

export function getDefaultTools(
  polygonTool: DrawingTool,
  canvasService: CanvasService,
  pointsService: PointsService,
  counterService: CounterService
) {
  return {
    pencil: new Pencil(),
    ellipse: new Ellipse(canvasService, pointsService, counterService),
    parallelogram: new Parallelogram(
      canvasService,
      pointsService,
      counterService
    ),
    line: new Line(canvasService, pointsService, counterService),
    polygon: polygonTool,
    triangle: new Triangle(canvasService, pointsService, counterService),
    rectangle: new Rectangle(canvasService, pointsService, counterService),
    trapezoid: new Trapezoid(canvasService, pointsService, counterService),
    rhombus: new Rhombus(canvasService, pointsService, counterService),
  };
}
