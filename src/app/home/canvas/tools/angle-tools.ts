export interface AngleToolAction {
  name: string;
  icon: string;
  tooltip: string;
}

export const angleToolMap: AngleToolAction[] = [
  {
    name: 'changeMeasurement',
    icon: 'angle-measurement-icon.svg',
    tooltip: 'CANVAS.TOOLTIP.ANGLE.CHANGEMEAGUREMENT',
  },
];
