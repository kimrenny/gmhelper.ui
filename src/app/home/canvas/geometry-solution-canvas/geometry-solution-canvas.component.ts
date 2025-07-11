import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
  AfterViewChecked,
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
import { getMousePos } from '../utils/mouse.utils';
import { ToolContext } from '../interfaces/tool-context.interface';

@Component({
  selector: 'app-geometry-solution-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './geometry-solution-canvas.component.html',
  styleUrls: ['./geometry-solution-canvas.component.scss'],
})
export class GeoSolutionCanvasComponent implements OnInit, OnDestroy {
  scale = 100;
  minScale = 50;
  maxScale = 200;
  currentScaleFactor = 1;

  taskSub!: Subscription;

  taskProcessing: boolean = true;

  @ViewChild('geoSolutionCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  constructor(
    private geoCanvasSolutionService: GeoCanvasSolutionService,
    private subjectService: SubjectService,
    private pointsService: PointsSolutionService,
    private linesService: LinesSolutionService,
    private stackService: StackSolutionService,
    private anglesService: AnglesSolutionService,
    private figureElementsService: FigureElementsSolutionService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.taskSub = this.geoCanvasSolutionService.taskId$.subscribe((taskId) => {
      console.log('taskId received:', taskId);

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
            } else {
            }
          });
      }
    });
  }

  updateCanvasSize(): void {
    if (!this.canvasRef?.nativeElement) {
      console.warn('Canvas element not found');
      return;
    }
    const canvas = this.canvasRef.nativeElement;

    const rect = canvas.getBoundingClientRect();
    console.log('Canvas bounding rect:', rect);

    console.log(
      'Canvas clientWidth:',
      canvas.clientWidth,
      'clientHeight:',
      canvas.clientHeight
    );

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.ctx = ctx;
      console.log('2D context obtained');
    } else {
      console.warn('Failed to get 2D context');
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
    if (!this.canvasRef) {
      console.warn('Canvas ref is undefined');
      return;
    }

    const canvas = this.canvasRef.nativeElement;

    if (!canvas) {
      console.warn('Canvas element not found in redraw');
      return;
    }

    if (!this.ctx) {
      console.warn('2D context is not initialized');
      return;
    }

    const rect = canvas.getBoundingClientRect();
    console.log('Redraw canvas rect:', rect);

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.setTransform(this.scale / 100, 0, 0, this.scale / 100, 0, 0);

    this.pointsService.resetPoints();

    const paths = this.stackService.getPaths();
    console.log('paths to redraw:', paths);
    console.log('Number of paths to draw:', paths.length);

    if (paths.length === 0) {
      console.warn('No paths found to draw');
    }

    for (const p of paths) {
      const color = p.path[0]?.color || '#000000';
      this.ctx.strokeStyle = color;

      if (p.tool.draw) {
        console.log('Drawing path with color:', color);
        p.tool.draw(this.ctx, p.path, color, true);
      } else {
        console.warn('No draw function found on tool for path');
      }
    }
  }

  updateCanvasTransform(): void {
    const scaleFactor = this.scale / 100;
    this.ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
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
    this.taskSub?.unsubscribe();
  }
}
