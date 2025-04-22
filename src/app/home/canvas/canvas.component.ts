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
import { Pencil } from './drawing-tools/pencil.tool';
import { Ellipse } from './drawing-tools/ellipse.tool';
import { Line } from './drawing-tools/line.tool';
import { Polygon } from './drawing-tools/polygon.tool';
import { Triangle } from './drawing-tools/triangle.tool';
import { Quad } from './drawing-tools/quad.tool';
import { Trapezoid } from './drawing-tools/trapezoid.tool';
import { Rhombus } from './drawing-tools/rhombus.tool';
import { ToastrService } from 'ngx-toastr';
import { COLORS } from './utils/colors';
import { getMousePos } from './utils/mouse.utils';
import { ToolSelector } from './tools/tool-selector';
import { ToolContext } from './interfaces/tool-context.interface';

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
  selectedColor: string = '#000000';
  subjects: string[] = ['Math', 'Geo'];
  colors = COLORS;

  private pencilTool = new Pencil();
  private ellipseTool = new Ellipse();
  private lineTool = new Line();
  private polygonTool = new Polygon();
  private triangleTool = new Triangle();
  private quadTool = new Quad();
  private trapezoidTool = new Trapezoid();
  private rhombusTool = new Rhombus();

  private currentTool: DrawingTool | null = null;
  private toolSelector!: ToolSelector;

  private drawing = false;
  private paths: {
    tool: DrawingTool;
    path: { x: number; y: number; color: string }[];
  }[] = [];

  @ViewChild('drawingCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewCanvas') previewCanvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private previewCtx!: CanvasRenderingContext2D;

  isColorPaletteVisible = false;
  shapeToolsVisible = false;

  constructor(
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.toolSelector = new ToolSelector({
      pencil: this.pencilTool,
      ellipse: this.ellipseTool,
      line: this.lineTool,
      polygon: this.polygonTool,
      triangle: this.triangleTool,
      quad: this.quadTool,
      trapezoid: this.trapezoidTool,
      rhombus: this.rhombusTool,
    });
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

    const toolContext: ToolContext = {
      canvas,
      previewCanvas,
      scale: this.scale,
      paths: this.paths,
      selectedColor: this.selectedColor,
      redraw: this.redraw.bind(this),
    };

    canvas.addEventListener('mousedown', (event) => {
      if (this.currentTool?.onMouseDown) {
        this.currentTool?.onMouseDown(event, toolContext);
      }
    });

    canvas.addEventListener('mousemove', (event) => {
      if (this.currentTool?.onMouseMove) {
        this.currentTool?.onMouseMove(event, toolContext);
      }
    });

    canvas.addEventListener('mouseup', (event) => {
      if (this.currentTool?.onMouseUp) {
        this.currentTool?.onMouseUp(event, toolContext);
        console.log('Paths after drawing:', this.paths);
      }
    });

    canvas.addEventListener('mouseleave', (event) => {
      if (this.currentTool?.onMouseLeave) {
        this.currentTool?.onMouseLeave?.(event, toolContext);
      }
    });
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
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.setTransform(this.scale / 100, 0, 0, this.scale / 100, 0, 0);

    for (const { tool, path } of this.paths) {
      if (path.length > 0) {
        tool.draw(
          this.ctx,
          path.map((p) => ({ x: p.x, y: p.y })),
          path[0].color
        );
      }
    }
  }

  updateCanvasTransform(): void {
    const scaleFactor = this.scale / 100;
    this.ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
  }

  selectTool(tool: string): void {
    this.currentTool = this.toolSelector.select(tool);
    this.shapeToolsVisible = false;
  }

  toggleColorPalette(): void {
    this.isColorPaletteVisible = !this.isColorPaletteVisible;
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

  onClearCanvas(): void {
    this.clearCanvas();
    this.shapeToolsVisible = false;
  }

  clearCanvas(): void {
    this.paths = [];
    this.redraw();
  }
}
