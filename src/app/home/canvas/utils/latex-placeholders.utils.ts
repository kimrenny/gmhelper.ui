import { LatexNode } from '../tools/math-expression.model';

export function addPlaceholderAttributes(
  container: HTMLElement,
  latexTree: LatexNode[],
  selectedId: string | null
) {
  const elements = Array.from(container.querySelectorAll('mo'));

  let placeholderIndex = 0;

  const markPlaceholders = (nodes: LatexNode[]) => {
    for (const node of nodes) {
      if (node.type === 'placeholder') {
        if (placeholderIndex >= elements.length) break;

        const el = elements[placeholderIndex] as HTMLElement;

        el.classList.add('placeholder');
        el.style.cursor = 'pointer';
        el.dataset['placeholderId'] = node.id || '';

        if (node.id === selectedId) {
          el.classList.add('selected-placeholder');
        } else {
          el.classList.remove('selected-placeholder');
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
            if (node.rows) {
              for (const row of node.rows) {
                if (placeholderIndex === 0) placeholderIndex++;
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

export function hasPlaceholders(nodes: LatexNode[]): boolean {
  return nodes.some((node) => {
    if (node.type === 'placeholder') return true;

    switch (node.type) {
      case 'fraction':
        return (
          hasPlaceholders(node.numerator ?? []) ||
          hasPlaceholders(node.denominator ?? [])
        );
      case 'power':
        return (
          hasPlaceholders(node.base ?? []) ||
          hasPlaceholders(node.exponent ?? [])
        );
      case 'sqrt':
        return hasPlaceholders(node.radicand ?? []);
      case 'nthRoot':
        return (
          hasPlaceholders(node.degree ?? []) ||
          hasPlaceholders(node.radicand ?? [])
        );
      case 'integral':
        return hasPlaceholders(node.integrand ?? []);
      case 'lim':
        return hasPlaceholders(node.expr ?? []);
      /* disabled */
      //case 'system':
      case 'matrix':
        return node.rows.some((row) => hasPlaceholders(row));
      default:
        return false;
    }
  });
}
