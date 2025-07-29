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
import { TranslateModule } from '@ngx-translate/core';
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
  latexNodesToLatex,
  parseLatexToNodes,
} from '../utils/latex.utils';

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

  private invalidLatexTimeout: any = null;
  private lastInvalidInput = '';

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

  addPlaceholderAttributes(container: HTMLElement) {
    const spans = Array.from(container.querySelectorAll('span'));

    let placeholderIndex = 0;

    const markPlaceholders = (nodes: LatexNode[]) => {
      for (const node of nodes) {
        if (node.type === 'placeholder') {
          if (placeholderIndex >= spans.length) break;

          const span = spans[placeholderIndex] as HTMLElement;

          span.classList.add('placeholder');
          span.style.cursor = 'pointer';
          span.dataset['placeholderId'] = node.id || '';

          if (node.id === this.selectedPlaceholderId) {
            span.classList.add('selected-placeholder');
          } else {
            span.classList.remove('selected-placeholder');
          }

          placeholderIndex++;
        } else {
          switch (node.type) {
            case 'fraction':
              if (node.numerator) markPlaceholders(node.numerator);
              if (node.denominator) markPlaceholders(node.denominator);
              break;
            case 'power':
              if (node.base) markPlaceholders(node.base);
              if (node.exponent) markPlaceholders(node.exponent);
              break;
            case 'sqrt':
              if (node.radicand) markPlaceholders(node.radicand);
              break;
            case 'nthRoot':
              if (node.degree) markPlaceholders(node.degree);
              if (node.radicand) markPlaceholders(node.radicand);
              break;
            case 'integral':
              if (node.integrand) markPlaceholders(node.integrand);
              break;
            case 'lim':
              if (node.expr) markPlaceholders(node.expr);
              break;
            case 'matrix':
            case 'system':
              if (node.rows) {
                for (const row of node.rows) {
                  markPlaceholders(row);
                }
              }
              break;
          }
        }
      }
    };

    markPlaceholders(this.latexTree);
  }

  renderLatexOnCanvas(): void {
    const div = this.mathDivRef.nativeElement.querySelector('.katex-wrapper');
    if (!div || !(div instanceof HTMLElement)) return;

    div.innerHTML = '';

    const latexStr = latexNodesToLatex(
      this.latexTree,
      this.selectedPlaceholderId
    );
    const wrappedLatex = `\\begin{aligned} ${latexStr} \\end{aligned}`;

    const fixedLatex = fixNestedPowers(wrappedLatex);

    if (!this.isLatexValid(fixedLatex)) return;

    katex.render(fixedLatex, div, {
      throwOnError: false,
      displayMode: true,
      output: 'mathml',
      trust: true,
    });

    this.latexInput = fixedLatex
      .replace(/\\begin{aligned}|\\end{aligned}/g, '')
      .trim();

    this.addPlaceholderAttributes(div);
  }

  replacePlaceholder(
    nodes: LatexNode[],
    placeholderId: string,
    newNodes: LatexNode[]
  ): LatexNode[] {
    return nodes.map((node) => {
      if (node.type === 'placeholder' && node.id === placeholderId) {
        return newNodes.length === 1
          ? newNodes[0]
          : { type: 'text', value: '' };
      }

      switch (node.type) {
        case 'fraction':
          return {
            ...node,
            numerator: node.numerator
              ? this.replacePlaceholder(node.numerator, placeholderId, newNodes)
              : node.numerator,
            denominator: node.denominator
              ? this.replacePlaceholder(
                  node.denominator,
                  placeholderId,
                  newNodes
                )
              : node.denominator,
          };
        case 'power':
          return {
            ...node,
            base: node.base
              ? this.replacePlaceholder(node.base, placeholderId, newNodes)
              : node.base,
            exponent: node.exponent
              ? this.replacePlaceholder(node.exponent, placeholderId, newNodes)
              : node.exponent,
          };
        case 'sqrt':
          return {
            ...node,
            radicand: node.radicand
              ? this.replacePlaceholder(node.radicand, placeholderId, newNodes)
              : node.radicand,
          };
        case 'nthRoot':
          return {
            ...node,
            degree: node.degree
              ? this.replacePlaceholder(node.degree, placeholderId, newNodes)
              : node.degree,
            radicand: node.radicand
              ? this.replacePlaceholder(node.radicand, placeholderId, newNodes)
              : node.radicand,
          };
        case 'integral':
          return {
            ...node,
            integrand: node.integrand
              ? this.replacePlaceholder(node.integrand, placeholderId, newNodes)
              : node.integrand,
          };
        case 'lim':
          return {
            ...node,
            expr: node.expr
              ? this.replacePlaceholder(node.expr, placeholderId, newNodes)
              : node.expr,
          };
        case 'matrix':
        case 'system':
          return {
            ...node,
            rows: node.rows.map((row) =>
              row.map(
                (cell) =>
                  this.replacePlaceholder([cell], placeholderId, newNodes)[0]
              )
            ),
          };
        default:
          return node;
      }
    });
  }

  onPlaceholderClick(placeholderId: string) {
    this.selectedPlaceholderId = placeholderId;
    this.renderLatexOnCanvas();
  }

  onWindowButtonClick(button: MathButton) {
    if (this.selectedPlaceholderId) {
      if (button.template) {
        this.latexTree = this.replacePlaceholder(
          this.latexTree,
          this.selectedPlaceholderId,
          [button.template]
        );
      } else {
        const newNode: LatexNode = { type: 'text', value: button.latex };
        this.latexTree = this.replacePlaceholder(
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
    const input = this.latexInput.trim();
    const wrapped = `\\begin{aligned} ${input} \\end{aligned}`;

    try {
      const fixedLatex = fixNestedPowers(wrapped);

      if (!this.isLatexValid(fixedLatex)) throw new Error('Invalid LaTeX');

      this.latexTree = parseLatexToNodes(
        fixedLatex.replace(/\\begin{aligned}|\\end{aligned}/g, '').trim()
      );

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

          this.latexTree = parseLatexToNodes(
            autofixed.replace(/\\begin{aligned|\\{aligned}/g, '').trim()
          );

          this.renderLatexOnCanvas();
        } catch (e2) {
          console.warn('Invalid after timeout.', e2);
        }
      }, 3000);
    }
  }

  isLatexValid(latex: string): boolean {
    try {
      katex.renderToString(latex, { throwOnError: true });
      return true;
    } catch {
      return false;
    }
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
