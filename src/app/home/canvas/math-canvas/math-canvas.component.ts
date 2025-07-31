import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SubjectService } from '../services/subject.service';
import { Subscription } from 'rxjs';
import {
  FUNCTIONAL_BUTTONS,
  MathButton,
  SPECIAL_BUTTONS,
} from '../tools/math-buttons';
import katex from 'katex';
import { LatexNode } from '../tools/math-expression.model';
import {
  fixNestedPowers,
  isLatexValid,
  latexNodesToLatex,
  parseLatexToNodes,
  unwrapAligned,
  wrapAligned,
} from '../utils/latex.utils';
import { replacePlaceholder } from '../utils/latex-tree.utils';
import {
  addPlaceholderAttributes,
  hasPlaceholders,
} from '../utils/latex-placeholders.utils';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-math-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './math-canvas.component.html',
  styleUrls: ['./math-canvas.component.scss'],
})
export class MathCanvasComponent implements OnInit, OnDestroy, AfterViewInit {
  selectedSubject: boolean = false;
  private subjectSub!: Subscription;

  latexTree: LatexNode[] = [];
  selectedPlaceholderId: string | null = null;
  latexInput: string = '';

  isSpecialWindowVisible = false;
  isFunctionalWindowVisible = false;
  isInputWindowVisible = false;

  specialWindowButtons: MathButton[] = [];
  functionalWindowButtons: MathButton[] = [];

  specialWindowRows: MathButton[][] = [];
  functionalWindowRows: MathButton[][] = [];

  private lastValidLatexInput: string = '';

  private invalidLatexTimeout: any = null;
  private lastInvalidInput = '';

  hasPlaceholders = hasPlaceholders;

  @ViewChild('mathDiv', { static: true })
  mathDivRef!: ElementRef<HTMLDivElement>;

  constructor(
    public subjectService: SubjectService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

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

  ngAfterViewInit() {
    this.mathDivRef.nativeElement.addEventListener(
      'click',
      this.onMathClick.bind(this)
    );
  }

  onMathClick(event: MouseEvent) {
    let target = event.target as HTMLElement | null;

    while (target && target !== this.mathDivRef.nativeElement) {
      if (target.dataset && target.dataset['placeholderId']) {
        this.selectedPlaceholderId = target.dataset['placeholderId'];
        this.renderLatexOnCanvas();
        break;
      }
      target = target.parentElement;
    }
  }

  renderLatexOnCanvas(
    trustMode: boolean = true,
    throwError: boolean = false
  ): void {
    const div = this.mathDivRef.nativeElement.querySelector('.katex-wrapper');
    if (!div || !(div instanceof HTMLElement)) return;

    div.innerHTML = '';

    const latexStr = latexNodesToLatex(
      this.latexTree,
      this.selectedPlaceholderId
    );
    const wrappedLatex = wrapAligned(latexStr);

    const fixedLatex = fixNestedPowers(wrappedLatex);

    if (!isLatexValid(fixedLatex)) return;

    katex.render(fixedLatex, div, {
      throwOnError: throwError,
      displayMode: true,
      output: 'mathml',
      trust: trustMode,
      strict: false,
    });

    this.latexInput = unwrapAligned(fixedLatex);

    this.lastValidLatexInput = this.latexInput;

    addPlaceholderAttributes(div, this.latexTree, this.selectedPlaceholderId);
  }

  onPlaceholderClick(placeholderId: string) {
    this.selectedPlaceholderId = placeholderId;
    this.renderLatexOnCanvas();
  }

  onWindowButtonClick(button: MathButton) {
    if (this.selectedPlaceholderId) {
      if (button.template) {
        this.latexTree = replacePlaceholder(
          this.latexTree,
          this.selectedPlaceholderId,
          [button.template]
        );
      } else {
        const newNode: LatexNode = { type: 'text', value: button.latex };
        this.latexTree = replacePlaceholder(
          this.latexTree,
          this.selectedPlaceholderId,
          [newNode]
        );
        this.selectedPlaceholderId = null;
      }
    } else {
      if (button.template) {
        this.latexTree.push(button.template);
      } else {
        this.latexTree.push({ type: 'text', value: button.latex });
      }
    }

    this.renderLatexOnCanvas();
  }

  onLatexInputChange() {
    if (hasPlaceholders(this.latexTree)) {
      this.latexInput = this.lastValidLatexInput;

      return;
    }

    const input = this.latexInput.trim();
    const wrapped = wrapAligned(input);

    try {
      const fixedLatex = fixNestedPowers(wrapped);

      if (!isLatexValid(fixedLatex)) throw new Error('Invalid LaTeX');

      this.latexTree = parseLatexToNodes(unwrapAligned(fixedLatex));

      this.renderLatexOnCanvas();

      if (this.invalidLatexTimeout) {
        clearTimeout(this.invalidLatexTimeout);
        this.invalidLatexTimeout = null;
      }
    } catch (e) {
      console.warn('Invalid LaTeX input:', e);

      this.lastInvalidInput = input;

      if (this.invalidLatexTimeout) {
        clearTimeout(this.invalidLatexTimeout);
      }

      this.invalidLatexTimeout = setTimeout(() => {
        if (this.lastInvalidInput !== this.latexInput.trim()) return;

        try {
          const autofixed = fixNestedPowers(wrapped);

          this.latexTree = parseLatexToNodes(unwrapAligned(autofixed));

          this.renderLatexOnCanvas();
        } catch (e2) {
          console.warn('Invalid after timeout.', e2);
        }
      }, 3000);
    }
  }

  toggleWindow(window: 'special' | 'functional' | 'input') {
    this.isSpecialWindowVisible =
      window === 'special' ? !this.isSpecialWindowVisible : false;
    this.isFunctionalWindowVisible =
      window === 'functional' ? !this.isFunctionalWindowVisible : false;
    this.isInputWindowVisible =
      window === 'input' ? !this.isInputWindowVisible : false;

    if (this.isInputWindowVisible && hasPlaceholders(this.latexTree)) {
      const message = this.translate.instant(
        'CANVAS.ERRORS.WARNING.PLACEHOLDER.EDIT_DISABLED'
      );
      const title = this.translate.instant('CANVAS.ERRORS.WARNING.TITLE');
      this.toastr.warning(message, title);
    }
  }

  getButtonRows(buttons: MathButton[]): MathButton[][] {
    const rows: MathButton[][] = [];
    for (let i = 0; i < buttons.length; i += 14) {
      rows.push(buttons.slice(i, i + 14));
    }
    return rows;
  }

  onClearCanvas(): void {
    this.latexTree = [];
    this.renderLatexOnCanvas();
  }

  ngOnDestroy(): void {
    this.subjectSub.unsubscribe();
  }
}
