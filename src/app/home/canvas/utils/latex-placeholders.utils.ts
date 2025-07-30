import { LatexNode } from '../tools/math-expression.model';

export function addPlaceholderAttributes(
  container: HTMLElement,
  latexTree: LatexNode[],
  selectedId: string | null
) {
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

        if (node.id === selectedId) {
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

  markPlaceholders(latexTree);
}
