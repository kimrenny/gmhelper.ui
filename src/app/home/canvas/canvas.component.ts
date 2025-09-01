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

  geoLoading: boolean = false;
  mathLoading: boolean = false;

  loadingKeys: string[] = [
    'CANVAS.PROCESSING.MESSAGE_1',
    'CANVAS.PROCESSING.MESSAGE_2',
    'CANVAS.PROCESSING.MESSAGE_3',
    'CANVAS.PROCESSING.MESSAGE_4',
    'CANVAS.PROCESSING.MESSAGE_5',
    'CANVAS.PROCESSING.MESSAGE_6',
    'CANVAS.PROCESSING.MESSAGE_7',
    'CANVAS.PROCESSING.MESSAGE_8',
    'CANVAS.PROCESSING.MESSAGE_9',
    'CANVAS.PROCESSING.MESSAGE_10',
    'CANVAS.PROCESSING.MESSAGE_11',
    'CANVAS.PROCESSING.MESSAGE_12',
    'CANVAS.PROCESSING.MESSAGE_13',
    'CANVAS.PROCESSING.MESSAGE_14',
    'CANVAS.PROCESSING.MESSAGE_15',
    'CANVAS.PROCESSING.MESSAGE_16',
    'CANVAS.PROCESSING.MESSAGE_17',
    'CANVAS.PROCESSING.MESSAGE_18',
    'CANVAS.PROCESSING.MESSAGE_19',
    'CANVAS.PROCESSING.MESSAGE_20',
  ];

  currentLoadingMessage: string = '';

  constructor(
    private toastr: ToastrService,
    private translate: TranslateService,
    private subjectService: SubjectService,
    private geoCanvasService: GeometryCanvasService,
    private mathCanvasService: MathCanvasService
  ) {}

  ngOnInit(): void {
    this.geoCanvasService.isProcessing$.subscribe((loading) => {
      if (loading) {
        this.pickRandomMessage();
      }
      this.geoLoading = loading;
    });

    this.mathCanvasService.isProcessing$.subscribe((loading) => {
      if (loading) {
        this.pickRandomMessage();
      }
      this.mathLoading = loading;
    });

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

  get isAnyLoading(): boolean {
    return this.geoLoading || this.mathLoading;
  }

  pickRandomMessage(): void {
    const index = Math.floor(Math.random() * this.loadingKeys.length);
    const key = this.loadingKeys[index];

    console.log(key);

    this.translate.get(key).subscribe((res: string) => {
      this.currentLoadingMessage = res;
    });
  }
}
