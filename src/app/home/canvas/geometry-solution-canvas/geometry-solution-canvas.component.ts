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
import { Observable, Subscription, throwError } from 'rxjs';
import { PointsSolutionService } from '../geometry-solution-services/points-solution.service';
import { LinesSolutionService } from '../geometry-solution-services/lines-solution.service';
import { StackSolutionService } from '../geometry-solution-services/stack-solution.service';
import { AnglesSolutionService } from '../geometry-solution-services/angles-solution.service';
import { FigureElementsSolutionService } from '../geometry-solution-services/figure-elements-solution.service';
import { CanvasService } from '../services/canvas.service';
import { TokenService } from 'src/app/services/token.service';
import { GivenSolutionService } from '../geometry-solution-services/given-solution.service';

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
  isAuthorized = false;
  private sub?: Subscription;

  isRated = false;
  rated: boolean | null = null;

  @ViewChild('geoSolutionCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasWrapper', { static: true })
  wrapperRef!: ElementRef<HTMLDivElement>;

  private ctx!: CanvasRenderingContext2D;

  constructor(
    private canvasService: CanvasService,
    private tokenService: TokenService,
    private geoCanvasSolutionService: GeoCanvasSolutionService,
    private pointsService: PointsSolutionService,
    private linesService: LinesSolutionService,
    private stackService: StackSolutionService,
    private anglesService: AnglesSolutionService,
    private figureElementsService: FigureElementsSolutionService,
    private givenService: GivenSolutionService,
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

    this.sub = this.tokenService.userRole$.subscribe((role) => {
      this.isAuthorized = !!role;
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

    this.drawGiven(canvas);
  }

  drawGiven(canvas: HTMLCanvasElement) {
    const given = this.givenService.getGiven();
    if (!given || given.trim() === '') return;

    const ctx = this.ctx;
    const scaleFactor = this.scale / 100;

    const baseFontSize = 14;
    const baseMargin = 20;
    const baseTopOffset = 75;
    const baseLineHeight = 16;
    const extraLineHeight = 10;

    ctx.save();

    ctx.font = `${baseFontSize}px Arial`;
    ctx.fillStyle = '#000';
    ctx.textAlign = 'left';

    const rawLines = given.split('\n');
    const processedLines: string[] = [];

    for (const rawLine of rawLines) {
      let currentLine = rawLine.trim();
      while (ctx.measureText(currentLine).width > canvas.width / 3) {
        let cutIndex = currentLine.lastIndexOf(
          ' ',
          (currentLine.length * 2) / 3
        );
        if (cutIndex === -1 || cutIndex < 5)
          cutIndex = Math.floor(currentLine.length / 2);
        processedLines.push(currentLine.slice(0, cutIndex).trim());
        currentLine = currentLine.slice(cutIndex).trim();
      }
      processedLines.push(currentLine);
    }

    const maxLineWidth = Math.max(
      ...processedLines.map((line) => ctx.measureText(line).width)
    );
    const minLineLengthPx = 150;

    const desiredLineLengthPx = Math.max(
      maxLineWidth + baseMargin * 2,
      minLineLengthPx
    );
    const baseLineLength = desiredLineLengthPx / scaleFactor;

    const rightEdgeX = canvas.width;
    const boxLeftX = rightEdgeX - baseLineLength * scaleFactor;
    const boxTopY = baseTopOffset;

    processedLines.forEach((line, i) => {
      ctx.fillText(line, boxLeftX + baseMargin, boxTopY + i * baseLineHeight);
    });

    const textHeight = processedLines.length * baseLineHeight;

    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    ctx.moveTo(rightEdgeX, boxTopY + textHeight - baseLineHeight / 3);
    ctx.lineTo(boxLeftX, boxTopY + textHeight - baseLineHeight / 3);
    ctx.lineTo(boxLeftX, boxTopY - baseLineHeight / 2 - extraLineHeight);

    ctx.stroke();
    ctx.restore();
  }

  onRateSolution(isCorrect: boolean): void {
    if (this.isRated) {
      this.toastr.warning(
        this.translate.instant('CANVAS.ERRORS.WARNING.RATED'),
        this.translate.instant('CANVAS.ERRORS.WARNING.TITLE')
      );
      return;
    }
    this.geoCanvasSolutionService.rateSolution(isCorrect).subscribe({
      next: (response) => {
        this.isRated = true;
        this.rated = isCorrect;
      },
      error: (error) => {
        console.error('Error during proccessing the request:', error);
      },
    });
  }

  onClose(): void {
    this.canvasService.updateTaskId(null);
    this.clearCanvas();
    this.isRated = false;
  }

  clearCanvas(): void {
    this.stackService.resetStack('paths');
    this.stackService.resetStack('redo');
    this.redraw();
    this.pointsService.resetPoints();
    this.linesService.clearAllLines();
    this.figureElementsService.clearAllFigureElements();
    this.anglesService.clearAllAngles();
    this.givenService.clear();
  }

  ngOnDestroy(): void {
    window.removeEventListener('wheel', this.preventPageZoom);
    this.taskSub?.unsubscribe();
  }
}
