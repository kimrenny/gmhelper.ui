export type LatexNode =
  | { type: 'text'; value: string }
  | { type: 'fraction'; numerator?: LatexNode[]; denominator?: LatexNode[] }
  | { type: 'sqrt'; radicand?: LatexNode[] }
  | { type: 'nthRoot'; degree?: LatexNode[]; radicand?: LatexNode[] }
  | { type: 'integral'; integrand?: LatexNode[] }
  | { type: 'lim'; expr?: LatexNode[] }
  | { type: 'matrix'; rows: LatexNode[][] }
  | { type: 'system'; rows: LatexNode[][] }
  | { type: 'placeholder'; id: string };
