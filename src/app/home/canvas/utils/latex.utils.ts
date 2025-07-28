import { LatexNode } from '../tools/math-expression.model';

export function latexNodesToLatex(
  nodes: LatexNode[],
  selectedId?: string | null
): string {
  if (!nodes) return '';

  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return node.value;
        case 'fraction':
          const numerator =
            node.numerator && node.numerator.length
              ? latexNodesToLatex(node.numerator)
              : '\\boxed{?}';
          const denominator =
            node.denominator && node.denominator.length
              ? latexNodesToLatex(node.denominator)
              : '\\boxed{?}';
          return `\\frac{${numerator}}{${denominator}}`;
        case 'power':
          const base =
            node.base && node.base.length
              ? latexNodesToLatex(node.base)
              : '\\boxed{?}';
          const exponent =
            node.exponent && node.exponent.length
              ? latexNodesToLatex(node.exponent)
              : '\\boxed{?}';
          return `${base}^{${exponent}}`;
        case 'sqrt':
          const radicand =
            node.radicand && node.radicand.length
              ? latexNodesToLatex(node.radicand)
              : '\\boxed{?}';
          return `\\sqrt{${radicand}}`;
        case 'nthRoot':
          const degree =
            node.degree && node.degree.length
              ? latexNodesToLatex(node.degree)
              : '\\boxed{?}';
          const nthRadicand =
            node.radicand && node.radicand.length
              ? latexNodesToLatex(node.radicand)
              : '\\boxed{?}';
          return `\\sqrt[${degree}]{${nthRadicand}}`;
        case 'integral':
          const integrand =
            node.integrand && node.integrand.length
              ? latexNodesToLatex(node.integrand)
              : '\\boxed{?}';
          return `\\int ${integrand} \\, dx`;
        case 'lim':
          const expr =
            node.expr && node.expr.length
              ? latexNodesToLatex(node.expr)
              : '\\boxed{?}';
          return `\\lim_{x \\to \\infty} ${expr}`;
        case 'matrix':
          if (!node.rows || !node.rows.length) return '\\boxed{?}';
          const rowsLatex = node.rows
            .map((row) =>
              row.map((cell) => latexNodesToLatex([cell])).join(' & ')
            )
            .join(' \\\\ ');
          return `\\begin{bmatrix} ${rowsLatex} \\end{bmatrix}`;
        case 'system':
          if (!node.rows || !node.rows.length) return '\\boxed{?}';
          const systemRows = node.rows
            .map((row) =>
              row.map((cell) => latexNodesToLatex([cell])).join(' & ')
            )
            .join(' \\\\ ');
          return `\\left\\{\\begin{array}{} ${systemRows} \\end{array}\\right.`;
        case 'placeholder':
          const classes = ['placeholder'];
          if (node.id === selectedId) {
            classes.push('selected-placeholder');
          }
          const style =
            node.id === selectedId
              ? 'border:2px solid gray; padding:2px; display:inline-block;'
              : 'border:2px solid black; padding:2px; display:inline-block;';
          return `\\htmlClass{${classes.join(' ')}}{\\htmlStyle{${style}}{?}}`;

        default:
          return '';
      }
    })
    .join('');
}

export function fixNestedPowers(latex: string): string {
  return latex.replace(/(\^(\{[^}]*\}|[^{}\^])){2,}/g, (match) => {
    const parts =
      match
        .match(/\^{([^}]*)}|(\^[^\{\}])/g)
        ?.map((part) => part.replace(/^\^(\{)?|(\})?$/g, '')) || [];

    const combined = parts.join('');

    return `^{${combined}}`;
  });
}
