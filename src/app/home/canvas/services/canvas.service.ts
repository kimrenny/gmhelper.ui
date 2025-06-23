import { Injectable } from '@angular/core';
import { Coords2d } from '../drawing-tools/types/coords.type';
import { PointsService } from './points.service';
import { StackService } from './stack.service';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  constructor(
    private pointsService: PointsService,
    private stackService: StackService
  ) {
    /* todo: Implement the generation of a file containing all data about the shapes and sending a request to the server. */
  }
}
