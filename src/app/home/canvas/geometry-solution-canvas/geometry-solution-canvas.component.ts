import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { GeoCanvasSolutionService } from '../geometry-solution-services/canvas-solution.service';
import { SubjectService } from '../services/subject.service';
import { Subscription } from 'rxjs';
import { PointsSolutionService } from '../geometry-solution-services/points-solution.service';
import { LinesSolutionService } from '../geometry-solution-services/lines-solution.service';
import { StackSolutionService } from '../geometry-solution-services/stack-solution.service';
import { AnglesSolutionService } from '../geometry-solution-services/angles-solution.service';
import { FigureElementsSolutionService } from '../geometry-solution-services/figure-elements-solution.service';

@Component({
  selector: 'app-geometry-solution-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './geometry-solution-canvas.component.html',
  styleUrls: ['./geometry-solution-canvas.component.scss'],
})
export class GeoSolutionCanvasComponent implements OnInit, OnDestroy {
  scale = 100;
  minScale = 100;
  maxScale = 200;

  offsetX = 0;
  offsetY = 0;

  private isPanning = false;
  private lastX = 0;
  private lastY = 0;

  taskSub!: Subscription;
  taskProcessing: boolean = true;

  @ViewChild('geoSolutionCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasWrapper', { static: true })
  wrapperRef!: ElementRef<HTMLDivElement>;

  private ctx!: CanvasRenderingContext2D;

  constructor(
    private geoCanvasSolutionService: GeoCanvasSolutionService,
    private pointsService: PointsSolutionService,
    private stackService: StackSolutionService,
    private anglesService: AnglesSolutionService,
    private figureElementsService: FigureElementsSolutionService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    window.addEventListener('wheel', this.preventPageZoom, { passive: false });

    this.taskSub = this.geoCanvasSolutionService.taskId$.subscribe((taskId) => {
      if (taskId) {
        this.geoCanvasSolutionService
          .getTaskFromApi(taskId)
          .subscribe((success) => {
            if (success) {
              this.taskProcessing = false;
              setTimeout(() => {
                this.updateCanvasSize();
                this.redraw();
              }, 0);
            }
          });
      }
    });
  }

  preventPageZoom = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  };

  updateCanvasSize(): void {
    const canvas = this.canvasRef.nativeElement;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.ctx = ctx;
    }
  }

  setCursor(cursorStyle: string): void {
    this.canvasRef.nativeElement.style.cursor = cursorStyle;
  }

  adjustScale(delta: number): void {
    this.scale = Math.min(
      this.maxScale,
      Math.max(this.minScale, this.scale + delta)
    );
    this.clampOffset();
    this.redraw();
  }

  startPan(event: MouseEvent): void {
    this.isPanning = true;
    const wrapperRect = this.wrapperRef.nativeElement.getBoundingClientRect();
    this.lastX = event.clientX - wrapperRect.left;
    this.lastY = event.clientY - wrapperRect.top;
  }

  onPan(event: MouseEvent): void {
    if (!this.isPanning) return;

    const wrapperRect = this.wrapperRef.nativeElement.getBoundingClientRect();
    const currentX = event.clientX - wrapperRect.left;
    const currentY = event.clientY - wrapperRect.top;

    const dx = currentX - this.lastX;
    const dy = currentY - this.lastY;

    this.lastX = currentX;
    this.lastY = currentY;

    this.offsetX += dx;
    this.offsetY += dy;

    this.clampOffset();
    this.redraw();
  }

  endPan(): void {
    this.isPanning = false;
  }

  private clampOffset(): void {
    const wrapper = this.wrapperRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    const scaleFactor = this.scale / 100;

    const scaledCanvasWidth = canvas.width * scaleFactor;
    const scaledCanvasHeight = canvas.height * scaleFactor;

    const wrapperWidth = wrapper.clientWidth;
    const wrapperHeight = wrapper.clientHeight;

    const minOffsetX = wrapperWidth - scaledCanvasWidth;
    const minOffsetY = wrapperHeight - scaledCanvasHeight;

    this.offsetX = Math.min(0, Math.max(minOffsetX, this.offsetX));
    this.offsetY = Math.min(0, Math.max(minOffsetY, this.offsetY));
  }

  onWheel(event: WheelEvent): void {
    if (!event.ctrlKey) return;

    event.preventDefault();

    const scaleChange = event.deltaY > 0 ? -10 : 10;

    const wrapperRect = this.wrapperRef.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - wrapperRect.left;
    const mouseY = event.clientY - wrapperRect.top;

    const prevScale = this.scale;
    this.scale = Math.min(
      this.maxScale,
      Math.max(this.minScale, this.scale + scaleChange)
    );
    const newScale = this.scale;

    if (newScale === prevScale) return;

    const scaleRatio = newScale / prevScale;

    this.offsetX = mouseX - scaleRatio * (mouseX - this.offsetX);
    this.offsetY = mouseY - scaleRatio * (mouseY - this.offsetY);

    this.clampOffset();
    this.redraw();
  }

  redraw(): void {
    const canvas = this.canvasRef.nativeElement;
    if (!this.ctx) return;

    this.ctx.setTransform(
      this.scale / 100,
      0,
      0,
      this.scale / 100,
      this.offsetX,
      this.offsetY
    );
    this.ctx.clearRect(
      -this.offsetX * (100 / this.scale),
      -this.offsetY * (100 / this.scale),
      canvas.width * (100 / this.scale),
      canvas.height * (100 / this.scale)
    );

    this.pointsService.resetPoints();

    const paths = this.stackService.getPaths();

    for (const p of paths) {
      const color = p.path[0]?.color || '#000000';
      this.ctx.strokeStyle = color;

      if (p.tool.draw) {
        p.tool.draw(this.ctx, p.path, color, true);
      }
    }
  }

  clearCanvas(): void {
    this.stackService.resetStack('paths');
    this.stackService.resetStack('redo');
    this.redraw();
    this.pointsService.resetPoints();
    this.figureElementsService.clearAllFigureElements();
    this.anglesService.clearAllAngles();
  }

  ngOnDestroy(): void {
    window.removeEventListener('wheel', this.preventPageZoom);
    this.taskSub?.unsubscribe();
  }
}
