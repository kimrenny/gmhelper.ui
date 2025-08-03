import { Injectable } from '@angular/core';
import { PlaceholderIdService } from './placeholderId.service';
import { LatexNode } from '../../tools/math-expression.model';
import {
  fixNestedPowers,
  latexNodesToLatex,
} from '../../utils/latex-parser.utils';
import {
  isLatexValid,
  unwrapAligned,
  wrapAligned,
} from '../../utils/latex-validation.utils';
import katex from 'katex';
import {
  addPlaceholderAttributes,
  assignNewPlaceholderIds,
} from '../../utils/latex-placeholders.utils';

@Injectable({
  providedIn: 'root',
})
export class LatexRendererService {
  constructor(private placeholderIdService: PlaceholderIdService) {}

  render(
    element: HTMLElement,
    tree: LatexNode[],
    selectedPlaceholderId: string | null,
    options: { trust?: boolean; throwError?: boolean } = {}
  ): { latex: string; success: boolean } {
    if (!element) return { latex: '', success: false };

    const { trust = false, throwError = false } = options;

    element.innerHTML = '';

    const rawLatex = latexNodesToLatex(tree, selectedPlaceholderId);
    const wrapped = wrapAligned(rawLatex);
    const fixedLatex = fixNestedPowers(wrapped);

    if (!isLatexValid(fixedLatex)) return { latex: '', success: false };

    try {
      katex.render(fixedLatex, element, {
        throwOnError: throwError,
        displayMode: true,
        output: 'mathml',
        trust,
        strict: false,
      });
    } catch {
      return { latex: '', success: false };
    }

    const unwrapped = unwrapAligned(fixedLatex);

    this.placeholderIdService.reset();
    assignNewPlaceholderIds(tree, this.placeholderIdService);
    addPlaceholderAttributes(element, tree, selectedPlaceholderId);

    return { latex: unwrapped, success: true };
  }
}
