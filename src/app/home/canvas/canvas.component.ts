import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { GeoCanvasComponent } from './geometry-canvas/geometry-canvas.component';
import { MathCanvasComponent } from './math-canvas/math-canvas.component';
import { SubjectService } from './services/subject.service';
import { CanvasService } from './services/canvas.service';
import { GeoSolutionCanvasComponent } from './geometry-solution-canvas/geometry-solution-canvas.component';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GeoCanvasComponent,
    MathCanvasComponent,
    GeoSolutionCanvasComponent,
  ],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit {
  selectedSubject: string = '';
  subjects: string[] = ['Math', 'Geo'];

  taskId: string | null = null;

  constructor(
    private toastr: ToastrService,
    private translate: TranslateService,
    private subjectService: SubjectService,
    private canvasSerivce: CanvasService
  ) {}

  ngOnInit(): void {
    this.canvasSerivce.taskId$.subscribe((id) => {
      this.taskId = id;
    });
  }

  selectSubject(subject: 'Math' | 'Geo'): void {
    if (subject === 'Math') {
      this.toastr.error(
        this.translate.instant('CANVAS.FEATURE_DISABLED'),
        this.translate.instant('ADMIN.ERRORS.ERROR')
      );
    }

    this.selectedSubject = subject;
    this.subjectService.setSubject(subject);
  }
}
