export interface MathButton {
  label: string;
  icon?: string;
  latex: string;
}

export const SPECIAL_BUTTONS: MathButton[] = [
  { label: '²', latex: '^2' },
  { label: '³', latex: '^3' },
  { label: '√', latex: '\\sqrt{}' },
  { label: '⋅', latex: '\\cdot' },
  { label: '×', latex: '\\times' },
  { label: '÷', latex: '\\div' },
  { label: '±', latex: '\\pm' },
  { label: '≠', latex: '\\neq' },
  { label: '≤', latex: '\\leq' },
  { label: '≥', latex: '\\geq' },
  { label: '∞', latex: '\\infty' },
  { label: '∈', latex: '\\in' },
  { label: '∉', latex: '\\notin' },
  { label: '∃', latex: '\\exists' },
  { label: '∀', latex: '\\forall' },
  { label: '∑', latex: '\\sum' },
  { label: '∫', latex: '\\int' },
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
  { label: 'xⁿ', icon: '', latex: 'x^n' },
  { label: 'sqrt', icon: 'assets/icons/square-root.png', latex: '\\sqrt{}' },
  { label: 'nthRoot', icon: 'assets/icons/nth-root.png', latex: '\\sqrt[n]{}' },
  { label: 'fraction', icon: 'assets/icons/fraction.png', latex: '\\frac{}{}' },
  {
    label: 'systemEquations',
    icon: 'assets/icons/system-equations.png',
    latex: '\\left\\{\\begin{array}{} \\end{array}\\right.',
  },
  {
    label: 'integral',
    icon: 'assets/icons/integral.png',
    latex: '\\int x \\, dx',
  },
  {
    label: 'lim',
    icon: '',
    latex: '\\lim_{x \\to \\infty} a_x',
  },
  {
    label: 'matrix',
    icon: 'assets/icons/matrix.png',
    latex: '\\begin{bmatrix} \\end{bmatrix}',
  },
];
