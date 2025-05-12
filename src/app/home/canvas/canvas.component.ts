import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
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

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit, AfterViewInit {
  scale = 100;
  minScale = 50;
  maxScale = 200;
  currentScaleFactor = 1;
  selectedSubject: string = '';
  subjects: string[] = ['Math', 'Geo'];
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

  constructor(
    private canvasService: CanvasService,
    private counterService: CounterService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.toolSelector = new ToolSelector(
      getDefaultTools(this.polygonTool, this.canvasService, this.counterService)
    );
    this.selectTool('pencil');
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
      paths: this.canvasService.getPaths(),
      selectedColor: '#000000',
      redraw: this.redraw.bind(this),
      getMousePos: (event: MouseEvent) =>
        getMousePos(event, canvas, this.scale),
    };

    canvas.addEventListener('mousedown', (event) => {
      const pos = this.toolContext.getMousePos(event);
      if (!pos) return;

      this.canvasService.resetSelectedLine();

      const lineData = this.canvasService.findLineByPoint(pos);
      if (lineData) {
        const toolName = lineData.attachedToFigure.split('_')[0];
        const tool = this.toolSelector.select('line');

        if (tool && tool.onSelectLine) {
          tool?.onSelectLine(
            lineData.point1,
            lineData.point2,
            this.toolContext.previewCanvas
          );
          this.canvasService.setSelectedLine(lineData.point1, lineData.point2);
        }

        return;
      }
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
          this.canvasService.pushStack(newPath, 'paths');
          this.canvasService.resetStack('redo');
        }
      }
    });

    canvas.addEventListener('mouseleave', (event) => {
      const pos = this.toolContext.getMousePos(event);
      if (!pos) return;
      this.currentTool?.onMouseLeave?.(pos, this.toolContext);
    });
  }

  get canUndo(): boolean {
    return this.canvasService.canUndo;
  }

  get canRedo(): boolean {
    return this.canvasService.canRedo;
  }

  get isLineSelected(): boolean {
    return this.canvasService.isLineSelected;
  }

  get isFigureSelected(): boolean {
    return this.canvasService.isFigureSelected;
  }

  changeFigureColor(color: string) {
    this.isFigureColorPaletteVisible = false;
    this.canvasService.changeFigureColor(color);
  }

  undo(): void {
    const lastPath = this.canvasService.popStack('paths');
    if (lastPath) {
      this.canvasService.pushStack(lastPath, 'redo');
      this.redraw();
    }
  }

  redo(): void {
    const restoredPath = this.canvasService.popStack('redo');
    if (restoredPath) {
      this.canvasService.pushStack(restoredPath, 'paths');
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
    this.canvasService.resetPoints();
    this.counterService.resetCounter();

    for (const p of this.canvasService.getPaths()) {
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

  toggleFigureColorPalette(): void {
    this.isFigureColorPaletteVisible = !this.isFigureColorPaletteVisible;
  }

  toggleShapeTools(): void {
    this.shapeToolsVisible = !this.shapeToolsVisible;
  }

  selectSubject(subject: 'Math' | 'Geo'): void {
    if (subject === 'Math') {
      this.toastr.error(
        this.translate.instant('CANVAS.FEATURE_DISABLED'),
        this.translate.instant('ADMIN.ERRORS.ERROR')
      );
      return;
    }
    this.selectedSubject = subject;
    this.clearCanvas();
  }

  selectColor(color: string): void {
    this.toolContext.selectedColor = color;
    this.isColorPaletteVisible = !this.isColorPaletteVisible;
  }

  onChangeLineLengthClick(): void {
    const selectedLine = this.canvasService.getSelectedLine();
    console.log('Called, selected line:', selectedLine);
    if (selectedLine) {
      const a = this.canvasService.getPointLabelByCoords(selectedLine.a);
      const b = this.canvasService.getPointLabelByCoords(selectedLine.b);
      if (!a || !b) return;

      const centerX = (selectedLine.a.x + selectedLine.b.x) / 2;
      const centerY = (selectedLine.a.y + selectedLine.b.y) / 2;

      this.lineLength = this.canvasService.getLineLength(a, b);
      this.lineInputPosition = { x: centerX, y: centerY };
      this.isLineLengthChanging = true;
    }
  }

  onLineLengthConfirm(): void {
    if (this.lineLength != null) {
      const selectedLine = this.canvasService.getSelectedLine();
      if (selectedLine) {
        const a = this.canvasService.getPointLabelByCoords(selectedLine.a);
        const b = this.canvasService.getPointLabelByCoords(selectedLine.b);
        if (!a || !b) return;
        this.canvasService.setLineLength(a, b, this.lineLength);
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
        this.counterService
      );
      this.toolSelector = new ToolSelector(
        getDefaultTools(
          this.polygonTool,
          this.canvasService,
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

  onClearCanvas(): void {
    this.clearCanvas();
    this.shapeToolsVisible = false;
  }

  clearCanvas(): void {
    this.canvasService.resetStack('paths');
    this.canvasService.resetStack('redo');
    this.redraw();
    this.canvasService.resetPoints();
    this.counterService.resetCounter();
  }
}
