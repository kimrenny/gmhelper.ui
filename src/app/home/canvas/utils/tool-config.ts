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
import { LinesService } from '../services/lines.service';
import { FigureElementsService } from '../services/figure-elements.service';
import { StackService } from '../services/stack.service';
import { FiguresService } from '../services/figures.service';

export function getDefaultTools(
  polygonTool: DrawingTool,
  canvasService: CanvasService,
  pointsService: PointsService,
  linesService: LinesService,
  anglesService: AnglesService,
  figureElementsService: FigureElementsService,
  stackService: StackService,
  figuresService: FiguresService,
  counterService: CounterService
) {
  return {
    pencil: new Pencil(),
    ellipse: new Ellipse(
      canvasService,
      pointsService,
      linesService,
      anglesService,
      figureElementsService,
      stackService,
      figuresService,
      counterService
    ),
    parallelogram: new Parallelogram(
      canvasService,
      pointsService,
      linesService,
      anglesService,
      figureElementsService,
      figuresService,
      counterService
    ),
    line: new Line(canvasService, pointsService, linesService, counterService),
    polygon: polygonTool,
    triangle: new Triangle(
      canvasService,
      pointsService,
      linesService,
      anglesService,
      figureElementsService,
      figuresService,
      counterService
    ),
    rectangle: new Rectangle(
      canvasService,
      pointsService,
      linesService,
      anglesService,
      figureElementsService,
      stackService,
      figuresService,
      counterService
    ),
    trapezoid: new Trapezoid(
      canvasService,
      pointsService,
      linesService,
      anglesService,
      figureElementsService,
      figuresService,
      counterService
    ),
    rhombus: new Rhombus(
      canvasService,
      pointsService,
      linesService,
      anglesService,
      figureElementsService,
      stackService,
      figuresService,
      counterService
    ),
  };
}
