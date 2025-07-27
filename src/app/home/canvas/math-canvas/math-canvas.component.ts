import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SubjectService } from '../services/subject.service';
import { Subscription } from 'rxjs';
import {
  FUNCTIONAL_BUTTONS,
  MathButton,
  SPECIAL_BUTTONS,
} from '../tools/math-buttons';
import katex from 'katex';

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

  latexInput: string = '';

  isSpecialWindowVisible = false;
  isFunctionalWindowVisible = false;
  isInputWindowVisible = false;

  specialWindowButtons: MathButton[] = [];
  functionalWindowButtons: MathButton[] = [];

  specialWindowRows: MathButton[][] = [];
  functionalWindowRows: MathButton[][] = [];

  @ViewChild('mathDiv', { static: true })
  mathDivRef!: ElementRef<HTMLDivElement>;

  constructor(public subjectService: SubjectService) {}

  ngOnInit(): void {
    this.subjectSub = this.subjectService.getSubject().subscribe((subject) => {
      this.selectedSubject = subject == 'Math';

      if (this.selectedSubject) {
        this.specialWindowButtons = SPECIAL_BUTTONS;
        this.functionalWindowButtons = FUNCTIONAL_BUTTONS;
        this.specialWindowRows = this.getButtonRows(SPECIAL_BUTTONS);
        this.functionalWindowRows = this.getButtonRows(FUNCTIONAL_BUTTONS);
      }
    });
  }

  renderLatexOnCanvas(): void {
    const div = this.mathDivRef.nativeElement.querySelector('.katex-wrapper');
    if (!div || !(div instanceof HTMLElement)) return;

    div.innerHTML = '';

    const latexWithLineBreaks = (this.latexInput || '').replace(/\n/g, '\\\\');
    const wrappedLatex = `\\begin{aligned} ${latexWithLineBreaks} \\end{aligned}`;

    console.log('Rendering LaTeX:', wrappedLatex);

    katex.render(wrappedLatex, div, {
      throwOnError: false,
      displayMode: true,
      output: 'mathml',
    });
  }

  toggleWindow(window: 'special' | 'functional' | 'input') {
    this.isSpecialWindowVisible =
      window === 'special' ? !this.isSpecialWindowVisible : false;
    this.isFunctionalWindowVisible =
      window === 'functional' ? !this.isFunctionalWindowVisible : false;
    this.isInputWindowVisible =
      window === 'input' ? !this.isInputWindowVisible : false;
  }

  getButtonRows(buttons: MathButton[]): MathButton[][] {
    const rows: MathButton[][] = [];
    for (let i = 0; i < buttons.length; i += 10) {
      rows.push(buttons.slice(i, i + 10));
    }
    return rows;
  }

  onWindowButtonClick(latex: string) {
    this.latexInput += latex;
    this.renderLatexOnCanvas();
  }

  onClearCanvas(): void {
    this.latexInput = '';
    this.renderLatexOnCanvas();
  }

  ngOnDestroy(): void {
    this.subjectSub.unsubscribe();
  }
}
