import { Injectable } from '@angular/core';
import { LineLength } from '../../drawing-tools/types/line-length.type';
import { PointsService } from './points.service';
import { Coords2d } from '../../drawing-tools/types/coords.type';
import { AnglesServiceInterface } from '../../interfaces/angles-service.interface';

@Injectable({
  providedIn: 'root',
})
export class AnglesService implements AnglesServiceInterface {
  private angles: Record<string, LineLength> = {};

  constructor(private pointsService: PointsService) {}

  getAllAngles(): Record<string, LineLength> {
    return this.angles;
  }

  getAngleLabelByCoords(coords: Coords2d): string | null {
    const point = this.pointsService
      .getAllPoints()
      .find((p) => p.x === coords.x && p.y === coords.y);
    if (point && this.angles[point.label]) {
      return point.label;
    }
    return null;
  }

  setAngleValue(label: string, value: LineLength): void {
    this.angles[label] = value;
  }

  getAngleValue(label: string): LineLength {
    return this.angles[label];
  }

  findAngleByPoint(pos: { x: number; y: number }): {
    label: string;
    attachedToFigure: string;
    attachedToPoint: number;
  } | null {
    for (const point of this.pointsService.getAllPoints()) {
      const dx = point.x - pos.x;
      const dy = point.y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= 10 && this.angles[point.label]) {
        return {
          label: point.label,
          attachedToFigure: point.attachedToFigure,
          attachedToPoint: point.attachedToPoint,
        };
      }
    }
    return null;
  }

  clearAllAngles(): void {
    this.angles = {};
  }
}
