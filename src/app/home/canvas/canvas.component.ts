import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { GeoCanvasComponent } from './geometry-canvas.component';
import { MathCanvasComponent } from './math-canvas.component';
import { SubjectService } from './services/subject.service';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GeoCanvasComponent,
    MathCanvasComponent,
  ],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent {
  selectedSubject: string = '';
  subjects: string[] = ['Math', 'Geo'];

  constructor(
    private toastr: ToastrService,
    private translate: TranslateService,
    private subjectService: SubjectService
  ) {}

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
