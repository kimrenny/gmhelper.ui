import { LatexNode } from '../tools/math-expression.model';

export function replacePlaceholder(
  nodes: LatexNode[],
  placeholderId: string,
  newNodes: LatexNode[]
): LatexNode[] {
  return nodes.map((node) => {
    if (node.type === 'placeholder' && node.id === placeholderId) {
      return newNodes.length === 1 ? newNodes[0] : { type: 'text', value: '' };
    }

    switch (node.type) {
      case 'fraction':
        return {
          ...node,
          numerator: node.numerator
            ? replacePlaceholder(node.numerator, placeholderId, newNodes)
            : node.numerator,
          denominator: node.denominator
            ? replacePlaceholder(node.denominator, placeholderId, newNodes)
            : node.denominator,
        };
      case 'power':
        return {
          ...node,
          base: node.base
            ? replacePlaceholder(node.base, placeholderId, newNodes)
            : node.base,
          exponent: node.exponent
            ? replacePlaceholder(node.exponent, placeholderId, newNodes)
            : node.exponent,
        };
      case 'sqrt':
        return {
          ...node,
          radicand: node.radicand
            ? replacePlaceholder(node.radicand, placeholderId, newNodes)
            : node.radicand,
        };
      case 'nthRoot':
        return {
          ...node,
          degree: node.degree
            ? replacePlaceholder(node.degree, placeholderId, newNodes)
            : node.degree,
          radicand: node.radicand
            ? replacePlaceholder(node.radicand, placeholderId, newNodes)
            : node.radicand,
        };
      case 'integral':
        return {
          ...node,
          integrand: node.integrand
            ? replacePlaceholder(node.integrand, placeholderId, newNodes)
            : node.integrand,
        };
      case 'lim':
        return {
          ...node,
          expr: node.expr
            ? replacePlaceholder(node.expr, placeholderId, newNodes)
            : node.expr,
        };
      case 'matrix':
      case 'system':
        return {
          ...node,
          rows: node.rows.map((row) =>
            row.map(
              (cell) => replacePlaceholder([cell], placeholderId, newNodes)[0]
            )
          ),
        };
      default:
        return node;
    }
  });
}
