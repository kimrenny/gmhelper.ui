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
import { AnglesService } from '../services/angles.service';

export function getDefaultTools(
  polygonTool: DrawingTool,
  canvasService: CanvasService,
  pointsService: PointsService,
  anglesService: AnglesService,
  counterService: CounterService
) {
  return {
    pencil: new Pencil(),
    ellipse: new Ellipse(canvasService, pointsService, counterService),
    parallelogram: new Parallelogram(
      canvasService,
      pointsService,
      anglesService,
      counterService
    ),
    line: new Line(canvasService, pointsService, counterService),
    polygon: polygonTool,
    triangle: new Triangle(
      canvasService,
      pointsService,
      anglesService,
      counterService
    ),
    rectangle: new Rectangle(
      canvasService,
      pointsService,
      anglesService,
      counterService
    ),
    trapezoid: new Trapezoid(
      canvasService,
      pointsService,
      anglesService,
      counterService
    ),
    rhombus: new Rhombus(
      canvasService,
      pointsService,
      anglesService,
      counterService
    ),
  };
}
