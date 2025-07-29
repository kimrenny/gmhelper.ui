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

export function parseLatexToNodes(input: string): LatexNode[] {
  const nodes: LatexNode[] = [];
  let i = 0;

  function parseGroup(): LatexNode[] {
    if (input[i] !== '{') return [];
    i++;
    const groupContent: string[] = [];
    let depth = 1;
    while (i < input.length && depth > 0) {
      if (input[i] === '{') depth++;
      else if (input[i] === '}') depth--;
      if (depth > 0) groupContent.push(input[i]);
      i++;
    }
    return parseLatexToNodes(groupContent.join(''));
  }

  while (i < input.length) {
    if (input.startsWith('\\frac', i)) {
      i += 5;
      const numerator = parseGroup();
      const denominator = parseGroup();
      nodes.push({ type: 'fraction', numerator, denominator });
    } else if (input.startsWith('\\sqrt', i)) {
      i += 5;
      const radicand = parseGroup();
      nodes.push({ type: 'sqrt', radicand });
    } else if (input.startsWith('\\int', i)) {
      i += 4;
      const integrand = parseLatexToNodes(input.slice(i));
      nodes.push({ type: 'integral', integrand });
      break;
    } else if (input.startsWith('\\lim', i)) {
      i += 4;
      const expr = parseLatexToNodes(input.slice(i));
      nodes.push({ type: 'lim', expr });
      break;
    } else if (input[i] === '^') {
      i++;
      const exponent = parseGroup();
      const base = nodes.length > 0 ? [nodes.pop()!] : [];
      nodes.push({ type: 'power', base, exponent });
    } else if (input[i] === '\\') {
      let cmd = '';
      i++;
      while (i < input.length && /[a-zA-Z]/.test(input[i])) {
        cmd += input[i++];
      }
      nodes.push({ type: 'text', value: '\\' + cmd });
    } else {
      let text = '';
      while (
        i < input.length &&
        input[i] !== '\\' &&
        input[i] !== '{' &&
        input[i] !== '}' &&
        input[i] !== '^'
      ) {
        text += input[i++];
      }
      if (text) nodes.push({ type: 'text', value: text });
    }
  }

  return nodes;
}

export function generateLatex(nodes: LatexNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return node.value;
        case 'fraction':
          return `\\frac{${generateLatex(
            node.numerator ?? []
          )}}{${generateLatex(node.denominator ?? [])}}`;
        case 'power':
          return `{${generateLatex(node.base ?? [])}}^{${generateLatex(
            node.exponent ?? []
          )}}`;
        case 'sqrt':
          return `\\sqrt{${generateLatex(node.radicand ?? [])}}`;
        case 'nthRoot':
          return `\\sqrt[${generateLatex(node.degree ?? [])}]{${generateLatex(
            node.radicand ?? []
          )}}`;
        case 'integral':
          return `\\int ${generateLatex(node.integrand ?? [])}`;
        case 'lim':
          return `\\lim ${generateLatex(node.expr ?? [])}`;
        case 'matrix':
          return (
            '\\begin{bmatrix}' +
            node.rows
              .map((row) =>
                generateLatex(row).replace(/\\placeholder{[^}]+}/g, '\\;')
              )
              .join(' \\\\ ') +
            '\\end{bmatrix}'
          );
        case 'system':
          return (
            '\\left\\{ \\begin{array}{l}' +
            node.rows
              .map((row) =>
                generateLatex(row).replace(/\\placeholder{[^}]+}/g, '\\;')
              )
              .join(' \\\\ ') +
            '\\end{array} \\right.'
          );
        case 'placeholder':
          return `\\placeholder{${node.id}}`;
        default:
          return '';
      }
    })
    .join('');
}
