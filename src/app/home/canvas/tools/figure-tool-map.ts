export interface FigureToolDefinition {
  name: string;
  icon: string;
  tooltip: string;
}

export type RawFigureToolMap = Record<string, FigureToolDefinition[]>;

export const rawFigureToolMap: RawFigureToolMap = {
  triangle: [
    {
      name: 'drawHeight',
      icon: 'height-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.TRIANGLE.DRAWHEIGHT',
    },
    {
      name: 'drawMedian',
      icon: 'median-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.TRIANGLE.DRAWMEDIAN',
    },
    {
      name: 'markAngles',
      icon: 'angle-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.TRIANGLE.MARKANGLES',
    },
  ],
  ellipse: [
    {
      name: 'drawRadius',
      icon: 'radius-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.ELLIPSE.DRAWRADIUS',
    },
    {
      name: 'drawDiameter',
      icon: 'diameter-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.ELLIPSE.DRAWDIAMETER',
    },
    {
      name: 'makeCircle',
      icon: 'ellipse-to-circle-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.ELLIPSE.MAKECIRCLE',
    },
  ],
  rectangle: [
    {
      name: 'drawDiagonal',
      icon: 'rect-diagonal-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.RECTANGLE.DRAWDIAGONAL',
    },
    {
      name: 'makeSquare',
      icon: 'rect-to-square-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.RECTANGLE.MAKESQUARE',
    },
    {
      name: 'rotate',
      icon: 'rect-rotation-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.RECTANGLE.ROTATE',
    },
  ],
  rhombus: [
    {
      name: 'drawDiagonal',
      icon: 'rhombus-diagonal-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.RHOMBUS.DRAWDIAGONAL',
    },
    {
      name: 'markAngles',
      icon: 'rhombus-angles-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.RHOMBUS.MARKANGLES',
    },
    {
      name: 'rotate',
      icon: 'rhombus-rotation-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.RHOMBUS.ROTATE',
    },
  ],
  trapezoid: [
    {
      name: 'drawDiagonal',
      icon: 'trapezoid-diagonal-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.TRAPEZOID.DRAWDIAGONAL',
    },
    {
      name: 'drawMidLine',
      icon: 'trapezoid-midline-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.TRAPEZOID.DRAWMIDLINE',
    },
    {
      name: 'markAngles',
      icon: 'trapezoid-angles-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.TRAPEZOID.MARKANGLES',
    },
  ],
  parallelogram: [
    {
      name: 'drawDiagonal',
      icon: 'parallelogram-diagonal-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.PARALLELOGRAM.DRAWDIAGONAL',
    },
    {
      name: 'makeRegular',
      icon: 'parallelogram-to-regular-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.PARALLELOGRAM.MAKEREGULAR',
    },
    {
      name: 'markAngles',
      icon: 'parallelogram-angles-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.PARALLELOGRAM.MARKANGLES',
    },
  ],
  polygon: [
    {
      name: 'markAngles',
      icon: 'polygon-angles-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.POLYGON.MARKANGLES',
    },
    {
      name: 'rotate',
      icon: 'polygon-rotation-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.POLYGON.ROTATE',
    },
    {
      name: 'rotateLabels',
      icon: 'polygon-labels-rotation-icon.svg',
      tooltip: 'CANVAS.TOOLTIP.FIGURE.ACTIONS.POLYGON.ROTATELABELS',
    },
  ],
};
