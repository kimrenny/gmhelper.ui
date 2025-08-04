import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { GeoCanvasComponent } from './geometry-canvas/geometry-canvas.component';
import { MathCanvasComponent } from './math-canvas/math-canvas.component';
import { SubjectService } from './services/subject.service';
import { CanvasService as GeometryCanvasService } from './services/geometry-canvas/canvas.service';
import { CanvasService as MathCanvasService } from './services/math-canvas/canvas.service';
import { GeoSolutionCanvasComponent } from './geometry-solution-canvas/geometry-solution-canvas.component';
import { MathSolutionCanvasComponent } from './math-solution-canvas/math-solution-canvas.component';

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
    MathSolutionCanvasComponent,
  ],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit {
  selectedSubject: string = '';
  subjects: string[] = ['Math', 'Geo'];

  geoTaskId: string | null = null;
  mathTaskId: string | null = null;

  constructor(
    private toastr: ToastrService,
    private translate: TranslateService,
    private subjectService: SubjectService,
    private geoCanvasService: GeometryCanvasService,
    private mathCanvasService: MathCanvasService
  ) {}

  ngOnInit(): void {
    this.geoCanvasService.taskId$.subscribe((id) => {
      this.geoTaskId = id;
      if (id) {
        this.mathTaskId = null;
      }
    });

    this.mathCanvasService.taskId$.subscribe((id) => {
      this.mathTaskId = id;
      if (id) {
        this.geoTaskId = null;
      }
    });
  }

  selectSubject(subject: 'Math' | 'Geo'): void {
    this.selectedSubject = subject;
    this.subjectService.setSubject(subject);
  }
}
