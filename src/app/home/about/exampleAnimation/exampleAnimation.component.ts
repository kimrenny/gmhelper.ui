import { Component } from '@angular/core';
import { ExampleCanvasComponent } from './example-canvas/example-canvas.component';
import { BinaryAnimationComponent } from './binary-animation/binaryAnimation.component';

@Component({
  selector: 'app-example-animation',
  standalone: true,
  templateUrl: './exampleAnimation.component.html',
  styleUrls: ['./exampleAnimation.component.scss'],
  imports: [ExampleCanvasComponent, BinaryAnimationComponent],
})
export class ExampleAnimationComponent {}
