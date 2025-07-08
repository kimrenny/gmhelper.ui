import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DrawingTool } from './interfaces/drawing-tool.interface';
import { Polygon } from './drawing-tools/polygon.tool';
import { ToastrService } from 'ngx-toastr';
import { COLORS } from './utils/colors';
import { getMousePos } from './utils/mouse.utils';
import { ToolSelector } from './tools/tool-selector';
import { ToolContext } from './interfaces/tool-context.interface';
import { getDefaultTools } from './utils/tool-config';
import { CanvasService } from './services/canvas.service';
import { CounterService } from './services/counter.service';
import { LineLength } from './drawing-tools/types/line-length.type';
import { Coords2d } from './drawing-tools/types/coords.type';
import { AngleToolAction, angleToolMap } from './tools/angle-tools';
import { AngleInputComponent } from './drawing-tools/angle-input/angle-input.component';
import { PointsService } from './services/points.service';
import { AnglesService } from './services/angles.service';
import { LinesService } from './services/lines.service';
import { StackService } from './services/stack.service';
import { FigureElementsService } from './services/figure-elements.service';
import { FiguresService } from './services/figures.service';
import { SelectionService } from './services/selection.service';
import { SubjectService } from './services/subject.service';
import { Subscription } from 'rxjs';
import { rawFigureToolMap } from './tools/figure-tool-map';

@Component({
  selector: 'app-geometry-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AngleInputComponent],
  templateUrl: './geometry-canvas.component.html',
  styleUrls: ['./geometry-canvas.component.scss'],
})
export class GeoCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  private subjectSub!: Subscription;
  selectedSubject: boolean = false;

  scale = 100;
  minScale = 50;
  maxScale = 200;
  currentScaleFactor = 1;
  selectedFigure: string | null = null;
  selectedAngle: string | null = null;
  colors = COLORS;

  private polygonTool!: Polygon;

  private currentTool: DrawingTool | null = null;
  private toolSelector!: ToolSelector;
  toolContext!: ToolContext;

  @ViewChild('drawingCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewCanvas') previewCanvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private previewCtx!: CanvasRenderingContext2D;

  isColorPaletteVisible = false;
  shapeToolsVisible = false;
  showPolygonInput = false;

  isFigureColorPaletteVisible = false;

  isLineLengthChanging = false;
  lineLength: LineLength = null;

  lineInputPosition: Coords2d | null = null;

  isFigureSelection: boolean = false;
  isAngleSelection: boolean = false;

  isAngleInputVisible = false;

  angleTools: AngleToolAction[] = angleToolMap;

  figureToolMap: Record<
    string,
    { name: string; icon: string; action: () => void }[]
  > = {};

  constructor(
    private canvasService: CanvasService,
    private subjectService: SubjectService,
    private pointsService: PointsService,
    private linesService: LinesService,
    private stackService: StackService,
    private anglesService: AnglesService,
    private figureElementsService: FigureElementsService,
    private figuresService: FiguresService,
    private selectionService: SelectionService,
    private counterService: CounterService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.subjectSub = this.subjectService.getSubject().subscribe((subject) => {
      this.selectedSubject = subject == 'Geo';
    });

    this.toolSelector = new ToolSelector(
      getDefaultTools(
        this.polygonTool,
        this.canvasService,
        this.pointsService,
        this.linesService,
        this.anglesService,
        this.figureElementsService,
        this.stackService,
        this.figuresService,
        this.counterService
      )
    );

    this.generateFigureToolMap();
    //this.selectTool('pencil');
  }

  ngAfterViewInit(): void {
    this.updateCanvasSize();
    this.setupCanvasEvents();
  }

  updateCanvasSize(): void {
    const canvas = this.canvasRef.nativeElement;
    const previewCanvas = this.previewCanvasRef.nativeElement;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    previewCanvas.width = previewCanvas.clientWidth;
    previewCanvas.height = previewCanvas.clientHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.ctx = ctx;
    }

    const previewCtx = previewCanvas.getContext('2d');
    if (previewCtx) {
      this.previewCtx = previewCtx;
    }
  }

  setupCanvasEvents(): void {
    const canvas = this.canvasRef.nativeElement;
    const previewCanvas = this.previewCanvasRef.nativeElement;

    this.toolContext = {
      canvas,
      previewCanvas,
      scale: this.scale,
      paths: this.stackService.getPaths(),
      selectedColor: '#000000',
      redraw: this.redraw.bind(this),
      getMousePos: (event: MouseEvent) =>
        getMousePos(event, canvas, this.scale),
    };

    canvas.addEventListener('mousedown', (event) => {
      const pos = this.toolContext.getMousePos(event);
      if (!pos) return;

      this.selectionService.resetSelectedLine();
      this.selectionService.setSelectedFigure(null);
      this.selectedAngle = null;

      const angleData = this.anglesService.findAngleByPoint(pos);

      if (this.isAngleSelection && angleData) {
        this.selectAngle(angleData);
        return;
      }

      const lineData = this.linesService.findLineByPoint(pos);
      const figureData = this.figuresService.findFigureByPoint(pos);

      if (lineData) {
        if (this.isFigureSelection) {
          this.selectFigure(lineData);
          return;
        }
        this.selectLine(lineData);
        return;
      }

      if (figureData) {
        if (this.isFigureSelection) {
          this.selectFigure(figureData);
        }
        return;
      }

      if (this.isFigureSelection || this.isAngleSelection) return;

      this.currentTool?.onMouseDown?.(pos, this.toolContext);
    });

    canvas.addEventListener('mousemove', (event) => {
      const pos = this.toolContext.getMousePos(event);
      if (!pos) return;
      this.currentTool?.onMouseMove?.(pos, this.toolContext);
    });

    canvas.addEventListener('mouseup', (event) => {
      const pos = this.toolContext.getMousePos(event);
      if (!pos) return;
      if (this.currentTool?.onMouseUp) {
        const newPath = this.currentTool.onMouseUp(pos, this.toolContext);
        if (newPath) {
          this.stackService.resetStack('redo');
          this.stackService.pushStack(newPath, 'paths');
        }
      }
    });

    canvas.addEventListener('mouseleave', (event) => {
      const pos = this.toolContext.getMousePos(event);
      if (!pos) return;
      this.currentTool?.onMouseLeave?.(pos, this.toolContext);
    });
  }

  generateFigureToolMap(): void {
    for (const [figure, tools] of Object.entries(rawFigureToolMap)) {
      this.figureToolMap[figure] = tools.map((tool) => ({
        ...tool,
        action: () =>
          this.handleFigureAction(this.selectedFigure ?? figure, tool.name),
      }));
    }
  }

  private selectLine(lineData: {
    point1: { x: number; y: number };
    point2: { x: number; y: number };
    attachedToFigure: string;
  }): void {
    this.clearPreviewCanvas();
    const tool = this.toolSelector.select('line');

    if (tool && tool.onSelectLine) {
      tool?.onSelectLine(
        lineData.point1,
        lineData.point2,
        this.toolContext.previewCanvas
      );
      this.selectionService.setSelectedLine(lineData.point1, lineData.point2);
    }

    return;
  }

  private selectFigure(lineData: {
    point1: { x: number; y: number };
    point2: { x: number; y: number };
    attachedToFigure: string;
  }): void {
    this.clearPreviewCanvas();
    const figureName = lineData.attachedToFigure;

    const toolName = figureName.split('_')[0].toLowerCase();

    const tool = this.toolSelector.select(toolName);

    const points = this.pointsService
      .getPointsByFigure(figureName)
      .map((p) => ({ x: p.x, y: p.y }));

    this.selectionService.setSelectedFigure(figureName);

    this.selectedFigure = figureName;

    if (tool) {
      if (tool.onSelectFigure) {
        tool.onSelectFigure(points, this.toolContext.previewCanvas);
      }
    }
  }

  private selectAngle(angleData: {
    label: string;
    attachedToFigure: string;
    attachedToPoint: number;
  }) {
    this.clearPreviewCanvas();
    const figureName = angleData.attachedToFigure;

    const toolName = figureName.split('_')[0].toLowerCase();

    const tool = this.toolSelector.select(toolName);

    const points = this.pointsService
      .getPointsByFigure(figureName)
      .map((p) => ({ x: p.x, y: p.y }));

    if (tool) {
      if (tool.onSelectAngle) {
        tool.onSelectAngle(
          this.toolContext.previewCanvas,
          points,
          angleData.label,
          angleData.attachedToFigure,
          angleData.attachedToPoint
        );
        this.selectedAngle = angleData.label;
      }
    }
  }

  get canUndo(): boolean {
    return this.stackService.canUndo;
  }

  get canRedo(): boolean {
    return this.stackService.canRedo;
  }

  get isLineSelected(): boolean {
    return this.selectionService.isLineSelected;
  }

  get isFigureSelected(): boolean {
    return this.selectionService.isFigureSelected;
  }

  changeFigureColor(color: string) {
    this.isFigureColorPaletteVisible = false;
    this.figuresService.changeFigureColor(color);
    this.redraw();
    this.deselectFigure();
    this.toolSelector.select('pencil');
  }

  undo(): void {
    const lastPath = this.stackService.popStack('paths');
    if (lastPath) {
      this.stackService.pushStack(lastPath, 'redo');
      this.redraw();
    }
    if (!this.canUndo) {
      this.deselectFigure();
      this.deselectAngle();
    }
  }

  redo(): void {
    const restoredPath = this.stackService.popStack('redo');
    if (restoredPath) {
      this.stackService.pushStack(restoredPath, 'paths');
      this.redraw();
    }
  }

  setCursor(cursorStyle: string): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.style.cursor = cursorStyle;
  }

  adjustScale(delta: number): void {
    const newScale = this.scale + delta;
    if (newScale >= this.minScale && newScale <= this.maxScale) {
      this.scale = newScale;
      this.redraw();
    }
  }

  redraw(): void {
    const canvas = this.canvasRef.nativeElement;
    const previewCanvas = this.previewCanvasRef.nativeElement;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    this.ctx.setTransform(this.scale / 100, 0, 0, this.scale / 100, 0, 0);
    this.previewCtx.setTransform(
      this.scale / 100,
      0,
      0,
      this.scale / 100,
      0,
      0
    );
    this.pointsService.resetPoints();
    this.counterService.resetCounter();

    this.counterService.setCounterFromFigures(
      this.figuresService.getAllFigures()
    );

    for (const p of this.stackService.getPaths()) {
      const color = p.path[0]?.color || '#000000';
      this.ctx.strokeStyle = color;

      if (p.tool.draw) {
        p.tool.draw(this.ctx, p.path, color, true);
      }
    }
  }

  updateCanvasTransform(): void {
    const scaleFactor = this.scale / 100;
    this.ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
    this.previewCtx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
  }

  selectTool(tool: string): void {
    if (tool === 'polygon') {
      this.openPolygonInput();
    } else {
      this.currentTool = this.toolSelector.select(tool);
    }
    this.shapeToolsVisible = false;
  }

  toggleColorPalette(): void {
    this.isColorPaletteVisible = !this.isColorPaletteVisible;
  }

  toggleFigureColorPalette(manual?: boolean): void {
    if (!this.isFigureSelected) return;
    if (manual) {
      this.isFigureColorPaletteVisible = manual;
    } else {
      this.isFigureColorPaletteVisible = !this.isFigureColorPaletteVisible;
    }
  }

  toggleFigureSelection(
    manual: boolean = false,
    changeTo: boolean = false
  ): void {
    if (manual) {
      this.isFigureSelection = changeTo;
    } else {
      this.isFigureSelection = !this.isFigureSelection;
    }

    if (this.isFigureSelection) {
      this.deselectAngle();
    } else {
      this.deselectFigure();
    }
  }

  toggleAngleSelection(): void {
    this.isAngleSelection = !this.isAngleSelection;

    if (this.isAngleSelection) {
      this.deselectFigure();
    } else {
      this.deselectAngle();
    }
  }

  onAngleConfirm(value: number) {
    if (!this.selectedAngle) return;
    this.anglesService.setAngleValue(this.selectedAngle, value);
    this.redraw();
    this.isAngleInputVisible = false;
  }

  deselectFigure(): void {
    this.selectionService.setSelectedFigure(null);
    this.isFigureSelection = false;
    this.selectedFigure = null;
    this.clearPreviewCanvas();
  }

  deselectAngle(): void {
    this.isAngleSelection = false;
    this.selectedAngle = null;
    this.isAngleInputVisible = false;
    this.clearPreviewCanvas();
  }

  toggleShapeTools(): void {
    this.shapeToolsVisible = !this.shapeToolsVisible;
  }

  selectColor(color: string): void {
    this.toolContext.selectedColor = color;
    this.isColorPaletteVisible = !this.isColorPaletteVisible;
  }

  onChangeLineLengthClick(): void {
    const selectedLine = this.selectionService.getSelectedLine();
    if (selectedLine) {
      const a = this.pointsService.getPointLabelByCoords(selectedLine.a);
      const b = this.pointsService.getPointLabelByCoords(selectedLine.b);
      if (!a || !b) return;

      const centerX = (selectedLine.a.x + selectedLine.b.x) / 2;
      const centerY = (selectedLine.a.y + selectedLine.b.y) / 2;

      this.lineLength = this.linesService.getLineLength(a, b);
      this.lineInputPosition = { x: centerX, y: centerY };
      this.isLineLengthChanging = true;
    }
  }

  onLineLengthConfirm(): void {
    if (this.lineLength != null) {
      const selectedLine = this.selectionService.getSelectedLine();
      if (selectedLine) {
        const a = this.pointsService.getPointLabelByCoords(selectedLine.a);
        const b = this.pointsService.getPointLabelByCoords(selectedLine.b);
        if (!a || !b) return;
        this.linesService.setLineLength(a, b, this.lineLength);
        this.isLineLengthChanging = false;
        this.lineLength = null;
        this.redraw();
      }
    }
  }

  openPolygonInput() {
    this.showPolygonInput = true;
  }

  closePolygonInput() {
    this.showPolygonInput = false;
  }

  confirmPolygonSides(value: string) {
    const sides = parseInt(value, 10);
    if (sides >= 3) {
      if (isNaN(sides)) {
        this.toastr.error(
          this.translate.instant('CANVAS.INVALID_SIDES_NUMBER') ||
            'Invalid number of sides',
          this.translate.instant('ADMIN.ERRORS.ERROR')
        );
        return;
      }
      this.polygonTool = new Polygon(
        sides,
        this.canvasService,
        this.pointsService,
        this.linesService,
        this.anglesService,
        this.figureElementsService,
        this.stackService,
        this.figuresService,
        this.counterService
      );
      this.toolSelector = new ToolSelector(
        getDefaultTools(
          this.polygonTool,
          this.canvasService,
          this.pointsService,
          this.linesService,
          this.anglesService,
          this.figureElementsService,
          this.stackService,
          this.figuresService,
          this.counterService
        )
      );
      this.currentTool = this.toolSelector.select('polygon');
      this.closePolygonInput();
    } else {
      this.closePolygonInput();
      this.toastr.error(
        this.translate.instant('CANVAS.INVALID_SIDES_NUMBER') ||
          'Invalid number of sides',
        this.translate.instant('ADMIN.ERRORS.ERROR')
      );
    }
  }

  handleFigureAction(figure: string, action: string) {
    const toolName = figure.split('_')[0].toLowerCase();
    const tool = this.toolSelector.select(toolName);

    tool?.handleAction?.(action, this.toolContext, figure);

    this.selectionService.setSelectedFigure(null);
    this.selectedFigure = null;
    this.clearPreviewCanvas();
    this.isFigureSelection = false;
    this.redraw();
  }

  handleAngleAction(actionName: string): void {
    switch (actionName) {
      case 'changeMeasurement': {
        this.isAngleInputVisible = true;
        break;
      }
      case 'func2': {
        break;
      }
      case 'func3': {
        break;
      }
    }
  }

  clearPreviewCanvas(): void {
    const previewCanvas = this.previewCanvasRef.nativeElement;
    this.previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  }

  onClearCanvas(): void {
    this.clearCanvas();
    this.shapeToolsVisible = false;
  }

  clearCanvas(): void {
    this.stackService.resetStack('paths');
    this.stackService.resetStack('redo');
    this.redraw();
    this.pointsService.resetPoints();
    this.counterService.resetCounter();
    this.figureElementsService.clearAllFigureElements();
    this.anglesService.clearAllAngles();
    this.deselectAngle();
    this.deselectFigure();
  }

  ngOnDestroy(): void {
    this.subjectSub.unsubscribe();
  }
}
