import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SubjectService } from './services/subject.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-math-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './math-canvas.component.html',
  styleUrls: ['./math-canvas.component.scss'],
})
export class MathCanvasComponent implements OnInit, OnDestroy {
  selectedSubject: boolean = false;
  private subjectSub!: Subscription;

  constructor(public subjectService: SubjectService) {}

  ngOnInit(): void {
    this.subjectSub = this.subjectService.getSubject().subscribe((subject) => {
      this.selectedSubject = subject == 'Math';
    });
  }

  clearCanvas(): void {}

  ngOnDestroy(): void {
    this.subjectSub.unsubscribe();
  }
}
