export interface FigureToolDefinition {
  name: string;
  icon: string;
}

export type RawFigureToolMap = Record<string, FigureToolDefinition[]>;

export const rawFigureToolMap: RawFigureToolMap = {
  triangle: [
    { name: 'drawHeight', icon: 'height-icon.svg' },
    { name: 'drawMedian', icon: 'median-icon.svg' },
    { name: 'markAngles', icon: 'angle-icon.svg' },
  ],
  ellipse: [
    { name: 'drawRadius', icon: 'radius-icon.svg' },
    { name: 'drawDiameter', icon: 'diameter-icon.svg' },
    { name: 'makeCircle', icon: 'ellipse-to-circle-icon.svg' },
  ],
  rectangle: [
    { name: 'drawDiagonal', icon: 'rect-diagonal-icon.svg' },
    { name: 'makeSquare', icon: 'rect-to-square-icon.svg' },
    { name: 'rotate', icon: 'rect-rotation-icon.svg' },
  ],
  rhombus: [
    { name: 'drawDiagonal', icon: 'rhombus-diagonal-icon.svg' },
    { name: 'markAngles', icon: 'rhombus-angles-icon.svg' },
    { name: 'rotate', icon: 'rhombus-rotation-icon.svg' },
  ],
  trapezoid: [
    { name: 'drawDiagonal', icon: 'trapezoid-diagonal-icon.svg' },
    { name: 'drawMidLine', icon: 'trapezoid-midline-icon.svg' },
    { name: 'markAngles', icon: 'trapezoid-angles-icon.svg' },
  ],
  parallelogram: [
    { name: 'drawDiagonal', icon: 'parallelogram-diagonal-icon.svg' },
    { name: 'makeRegular', icon: 'parallelogram-to-regular-icon.svg' },
    { name: 'markAngles', icon: 'parallelogram-angles-icon.svg' },
  ],
  polygon: [
    { name: 'markAngles', icon: 'polygon-angles-icon.svg' },
    { name: 'rotate', icon: 'polygon-rotation-icon.svg' },
    { name: 'rotateLabels', icon: 'polygon-labels-rotation-icon.svg' },
  ],
};
