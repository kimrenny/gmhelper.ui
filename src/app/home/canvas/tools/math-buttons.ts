import { LatexNode } from './math-expression.model';

export interface MathButton {
  label: string;
  icon?: string;
  latex: string;
  template?: LatexNode;
}

let placeholderIdCounter = 0;

function createPlaceholder(): LatexNode {
  return {
    type: 'placeholder',
    id: `ph_${placeholderIdCounter++}`,
  };
}

export const SPECIAL_BUTTONS: MathButton[] = [
  { label: '0', latex: '0' },
  { label: '1', latex: '1' },
  { label: '2', latex: '2' },
  { label: '3', latex: '3' },
  { label: '4', latex: '4' },
  { label: '5', latex: '5' },
  { label: '6', latex: '6' },
  { label: '7', latex: '7' },
  { label: '8', latex: '8' },
  { label: '9', latex: '9' },
  { label: '²', latex: '^2' },
  { label: '³', latex: '^3' },
  { label: '⋅', latex: '\\cdot' },
  { label: '×', latex: '\\times' },
  { label: '÷', latex: '\\div' },
  { label: '±', latex: '\\pm' },
  { label: '=', latex: '=' },
  { label: '≠', latex: '\\neq' },
  { label: '≤', latex: '\\leq' },
  { label: '≥', latex: '\\geq' },
  { label: 'x', latex: 'x' },
  { label: 'y', latex: 'y' },
  { label: 'z', latex: 'z' },
  { label: 'i', latex: 'i' },
  { label: 'j', latex: 'j' },
  { label: 'k', latex: 'k' },
  { label: 'n', latex: 'n' },
  { label: '∞', latex: '\\infty' },
  { label: '∈', latex: '\\in' },
  { label: '∉', latex: '\\notin' },
  { label: '∃', latex: '\\exists' },
  { label: '∀', latex: '\\forall' },
  { label: '∑', latex: '\\sum' },
  { label: '∅', latex: '\\emptyset' },
  { label: '∪', latex: '\\cup' },
  { label: '∩', latex: '\\cap' },
  { label: '⊂', latex: '\\subset' },
  { label: '⊃', latex: '\\supset' },
  { label: '⊆', latex: '\\subseteq' },
  { label: '⊇', latex: '\\supseteq' },
  { label: 'π', latex: '\\pi' },
  { label: 'Δ', latex: '\\Delta' },
  { label: '∇', latex: '\\nabla' },
  { label: '⊥', latex: '\\perp' },
  { label: '∥', latex: '\\parallel' },
  { label: 'log', latex: '\\log' },
  { label: 'ln', latex: '\\ln' },
  { label: 'e', latex: 'e' },
  { label: 'eˣ', latex: 'e^x' },
  { label: 'α', latex: '\\alpha' },
  { label: 'β', latex: '\\beta' },
  { label: 'ω', latex: '\\omega' },
  { label: 'Φ', latex: '\\Phi' },
];

export const FUNCTIONAL_BUTTONS: MathButton[] = [
  { label: 'x²', icon: '', latex: 'x^2' },
  {
    label: 'xⁿ',
    icon: '',
    latex: 'x^n',
    template: {
      type: 'power',
      base: [createPlaceholder()],
      exponent: [createPlaceholder()],
    },
  },
  {
    label: 'sqrt',
    icon: 'assets/icons/square-root.png',
    latex: '\\sqrt{}',
    template: { type: 'sqrt', radicand: [createPlaceholder()] },
  },
  {
    label: 'nthRoot',
    icon: 'assets/icons/nth-root.png',
    latex: '\\sqrt[n]{}',
    template: {
      type: 'nthRoot',
      degree: [createPlaceholder()],
      radicand: [createPlaceholder()],
    },
  },
  {
    label: 'fraction',
    icon: 'assets/icons/fraction.png',
    latex: '\\frac{}{}',
    template: {
      type: 'fraction',
      numerator: [createPlaceholder()],
      denominator: [createPlaceholder()],
    },
  },
  // disabled
  // {
  //   label: 'systemEquations',
  //   icon: 'assets/icons/system-equations.png',
  //   latex: '\\left\\{\\begin{array}{} \\end{array}\\right.',
  //   template: {
  //     type: 'system',
  //     rows: [[createPlaceholder()], [createPlaceholder()]],
  //   },
  // },
  {
    label: 'integral',
    icon: 'assets/icons/integral.png',
    latex: '\\int x \\, dx',
    template: {
      type: 'integral',
      integrand: [createPlaceholder()],
    },
  },
  {
    label: 'lim',
    icon: '',
    latex: '\\lim_{x \\to \\infty} a_x',
    template: {
      type: 'lim',
      expr: [createPlaceholder()],
    },
  },
  {
    label: 'matrix',
    icon: 'assets/icons/matrix.png',
    latex: '\\begin{bmatrix} \\end{bmatrix}',
    template: {
      type: 'matrix',
      rows: [
        [createPlaceholder(), createPlaceholder(), createPlaceholder()],
        [createPlaceholder(), createPlaceholder(), createPlaceholder()],
        [createPlaceholder(), createPlaceholder(), createPlaceholder()],
      ],
    },
  },
];
