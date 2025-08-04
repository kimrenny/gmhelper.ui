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
import { Subscription } from 'rxjs';
import { TokenService } from 'src/app/services/token.service';
import { MathCanvasSolutionService } from '../math-solution-services/canvas-solution.service';
import { CanvasService } from '../services/math-canvas/canvas.service';
import { LatexRendererService } from '../services/math-canvas/latex-renderer.service';

@Component({
  selector: 'app-math-solution-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './math-solution-canvas.component.html',
  styleUrls: ['./math-solution-canvas.component.scss'],
})
export class MathSolutionCanvasComponent implements OnInit, OnDestroy {
  taskSub!: Subscription;
  taskProcessing: boolean = true;
  isAuthorized = false;
  private sub?: Subscription;

  isRated = false;
  rated: boolean | null = null;

  @ViewChild('mathSolutionDiv', { static: true })
  mathDivRef!: ElementRef<HTMLDivElement>;

  constructor(
    private canvasService: CanvasService,
    private tokenService: TokenService,
    private mathCanvasSolutionService: MathCanvasSolutionService,
    private latexRenderer: LatexRendererService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.taskSub = this.mathCanvasSolutionService.taskId$.subscribe(
      (taskId) => {
        if (taskId) {
          this.mathCanvasSolutionService
            .getTaskFromApi(taskId)
            .subscribe((success) => {
              if (success) {
                this.taskProcessing = false;
                const latex = this.mathCanvasSolutionService.getLatexSolution();
                this.renderLatex(latex);
              }
            });
        }
      }
    );

    this.sub = this.tokenService.userRole$.subscribe((role) => {
      this.isAuthorized = !!role;
    });
  }

  renderLatex(latex: string) {
    const div = this.mathDivRef.nativeElement.querySelector(
      '.solution-katex-wrapper'
    );
    if (!div || !(div instanceof HTMLElement)) return;

    div.innerHTML = '';

    this.latexRenderer.renderLatex(div, latex, {
      trust: false,
      throwError: false,
    });
  }

  onRateSolution(isCorrect: boolean): void {
    if (this.isRated) {
      this.toastr.warning(
        this.translate.instant('CANVAS.ERRORS.WARNING.RATED'),
        this.translate.instant('CANVAS.ERRORS.WARNING.TITLE')
      );
      return;
    }
    this.mathCanvasSolutionService.rateSolution(isCorrect).subscribe({
      next: () => {
        this.isRated = true;
        this.rated = isCorrect;
      },
      error: (error) => {
        if (error.message === 'USER_NOT_AUTHORIZED_CLIENT') {
          this.toastr.error(
            this.translate.instant('CANVAS.ERRORS.ERROR.NOT_AUTHORIZED'),
            this.translate.instant('CANVAS.ERRORS.ERROR.TITLE')
          );
          return;
        }

        if (error.status === 401) {
          const message = error?.error?.message || '';

          if (message === 'Only the task creator can rate this task.') {
            this.toastr.error(
              this.translate.instant('CANVAS.ERRORS.ERROR.NOT_TASK_CREATOR'),
              this.translate.instant('CANVAS.ERRORS.ERROR.TITLE')
            );
            return;
          }

          this.toastr.error(
            this.translate.instant('CANVAS.ERRORS.ERROR.UNAUTHORIZED'),
            this.translate.instant('CANVAS.ERRORS.ERROR.TITLE')
          );
          return;
        }

        this.toastr.error(
          this.translate.instant('CANVAS.ERRORS.ERROR.UNKNOWN'),
          this.translate.instant('CANVAS.ERRORS.ERROR.TITLE')
        );
        console.error('Error during proccessing the request:', error);
      },
    });
  }

  onClose(): void {
    this.canvasService.updateTaskId(null);
    this.clearCanvas();
    this.isRated = false;
  }

  private clearCanvas() {
    this.mathCanvasSolutionService.clear();
  }

  ngOnDestroy(): void {
    this.taskSub?.unsubscribe();
  }
}
