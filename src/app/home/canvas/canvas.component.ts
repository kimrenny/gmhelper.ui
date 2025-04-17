import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DrawingTool } from './drawing-tools/drawing-tool.interface';
import { Pencil } from './drawing-tools/pencil.tool';
import { Ellipse } from './drawing-tools/ellipse.tool';
import { Line } from './drawing-tools/line.tool';
import { Polygon } from './drawing-tools/polygon.tool';
import { Triangle } from './drawing-tools/triangle.tool';
import { Quad } from './drawing-tools/quad.tool';
import { Trapezoid } from './drawing-tools/trapezoid.tool';
import { Rhombus } from './drawing-tools/rhombus.tool';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit {
  scale = 100;
  minScale = 50;
  maxScale = 200;
  currentScaleFactor = 1;
  selectedSubject: string = '';
  selectedColor: string = '#000000';
  subjects: string[] = ['Math', 'Geo'];

  private pencilTool: Pencil = new Pencil();
  private ellipseTool: Ellipse = new Ellipse();
  private lineTool: Line = new Line();
  private polygonTool: Polygon = new Polygon();
  private triangleTool: Triangle = new Triangle();
  private quadTool: Quad = new Quad();
  private trapezoidTool: Trapezoid = new Trapezoid();
  private rhombusTool: Rhombus = new Rhombus();

  private currentTool: DrawingTool | null = null;
  private drawing = false;
  private paths: {
    tool: DrawingTool;
    path: { x: number; y: number; color: string }[];
  }[] = [];

  colors: string[] = [
    '#000000',
    '#808080',
    '#C0C0C0',
    '#FFFFFF',
    '#FF0000',
    '#FF4500',
    '#FF6347',
    '#8B0000',
    '#FF1493',
    '#FFC0CB',
    '#FFA500',
    '#FFD700',
    '#FFFF00',
    '#008000',
    '#32CD32',
    '#00FA9A',
    '#006400',
    '#0000FF',
    '#4682B4',
    '#00CED1',
    '#00008B',
    '#4B0082',
    '#EE82EE',
    '#9400D3',
    '#A52A2A',
  ];

  @ViewChild('drawingCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  isColorPaletteVisible = false;
  shapeToolsVisible = false;

  constructor(
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngAfterViewInit(): void {
    this.updateCanvasSize();
    this.setupCanvasEvents();
    this.currentTool = this.pencilTool;
  }

  updateCanvasSize(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    this.ctx = canvas.getContext('2d')!;
  }

  setupCanvasEvents(): void {
    const canvas = this.canvasRef.nativeElement;

    canvas.addEventListener('mousedown', (event) => {
      const mousePos = this.getMousePos(event);
      if (mousePos && this.currentTool instanceof Triangle) {
        const triangleTool = this.currentTool as Triangle;
        triangleTool.addPoint(mousePos);

        if (
          triangleTool.points.length === 2 ||
          triangleTool.points.length === 0
        ) {
          this.redraw();
        }
      }
      this.startDrawing(event);
    });

    canvas.addEventListener('mousemove', (event) =>
      this.handleMouseMove(event)
    );
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mouseleave', () => this.stopDrawing());
  }

  handleMouseMove(event: MouseEvent): void {
    const mousePos = this.getMousePos(event);

    if (!mousePos) {
      this.setCursor('not-allowed');
      return;
    }

    this.setCursor('crosshair');

    if (this.drawing && this.currentTool) {
      const currentPath = this.paths[this.paths.length - 1].path;
      currentPath.push({
        x: mousePos.x,
        y: mousePos.y,
        color: this.selectedColor,
      });
      this.redraw();
    } else if (this.currentTool instanceof Triangle) {
      const triangleTool = this.currentTool as Triangle;
      triangleTool.setPreviewPoint(mousePos);
      this.redraw();
    }
  }

  startDrawing(event: MouseEvent): void {
    const mousePos = this.getMousePos(event);

    if (!mousePos) {
      return;
    }

    this.drawing = true;

    this.paths.push({
      tool: this.currentTool!,
      path: [
        {
          x: mousePos.x,
          y: mousePos.y,
          color: this.selectedColor,
        },
      ],
    });
  }

  stopDrawing(): void {
    this.drawing = false;
    this.redraw();
  }

  getMousePos(event: MouseEvent): { x: number; y: number } | null {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleFactor = this.scale / 100;

    const x = (event.clientX - rect.left) / scaleFactor;
    const y = (event.clientY - rect.top) / scaleFactor;

    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
      return null;
    }

    return {
      x: Math.max(0, Math.min(x, canvas.width)),
      y: Math.max(0, Math.min(y, canvas.height)),
    };
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
    this.updateCanvasTransform();

    this.paths.forEach((pathData) => {
      if (pathData.path.length > 0) {
        pathData.tool.draw(this.ctx, pathData.path, pathData.path[0].color);
      }
    });
  }

  updateCanvasTransform(): void {
    const scaleFactor = this.scale / 100;
    this.ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
  }

  selectTool(tool: string): void {
    switch (tool) {
      case 'pencil':
        this.currentTool = this.pencilTool;
        break;
      case 'ellipse':
        this.currentTool = this.ellipseTool;
        break;
      case 'line':
        this.currentTool = this.lineTool;
        break;
      case 'polygon':
        this.currentTool = this.polygonTool;
        break;
      case 'triangle':
        this.currentTool = this.triangleTool;
        break;
      case 'quad':
        this.currentTool = this.quadTool;
        break;
      case 'trapezoid':
        this.currentTool = this.trapezoidTool;
        break;
      case 'rhombus':
        this.currentTool = this.rhombusTool;
        break;
      default:
        this.currentTool = null;
        break;
    }
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
    this.triangleTool.clear();
    this.redraw();
  }
}
