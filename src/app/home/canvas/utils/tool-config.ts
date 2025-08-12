import { Pencil } from '../drawing-tools/pencil.tool';
import { Ellipse } from '../drawing-tools/ellipse.tool';
import { Parallelogram } from '../drawing-tools/parallelogram.tool';
import { Line } from '../drawing-tools/line.tool';
import { Triangle } from '../drawing-tools/triangle.tool';
import { Rectangle } from '../drawing-tools/rectangle.tool';
import { Trapezoid } from '../drawing-tools/trapezoid.tool';
import { Rhombus } from '../drawing-tools/rhombus.tool';
import { DrawingTool } from '../interfaces/drawing-tool.interface';
import { CanvasServiceInterface } from '../interfaces/canvas-service.interface';
import { PointsServiceInterface } from '../interfaces/points-service.interface';
import { LinesServiceInterface } from '../interfaces/lines-service.interface';
import { AnglesServiceInterface } from '../interfaces/angles-service.interface';
import { FigureElementsServiceInterface } from '../interfaces/figure-elements-service.interface';
import { StackServiceInterface } from '../interfaces/stack-service.interface';
import { FiguresServiceInterface } from '../interfaces/figures-service.interface';
import { CounterServiceInterface } from '../interfaces/counter-service.interface';

export function getDefaultTools(
  polygonFactory: (sides: number) => DrawingTool,
  canvasService: CanvasServiceInterface,
  pointsService: PointsServiceInterface,
  linesService: LinesServiceInterface,
  anglesService: AnglesServiceInterface,
  figureElementsService: FigureElementsServiceInterface,
  stackService: StackServiceInterface,
  figuresService: FiguresServiceInterface,
  counterService: CounterServiceInterface
) {
  return {
    pencil: new Pencil(counterService),
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
      stackService,
      figuresService,
      counterService
    ),
    line: new Line(canvasService, pointsService, linesService, counterService),
    polygon: polygonFactory,
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
