import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ExampleCanvasComponent } from './example-canvas/example-canvas.component';
import { BinaryAnimationComponent } from './binary-animation/binaryAnimation.component';
import { ExampleResponseComponent } from './example-response/example-response.component';
import { AboutService } from 'src/app/services/about.service';

@Component({
  selector: 'app-example-animation',
  standalone: true,
  templateUrl: './exampleAnimation.component.html',
  styleUrls: ['./exampleAnimation.component.scss'],
  imports: [
    ExampleCanvasComponent,
    BinaryAnimationComponent,
    ExampleResponseComponent,
  ],
})
export class ExampleAnimationComponent implements OnInit, OnDestroy {
  private observer: IntersectionObserver | null = null;
  private hasBeenVisible: boolean = false;

  private animationExampleCanvasTimeout: any;
  private animationBinaryTimeout: any;
  private animationExampleResponseTimeout: any;

  constructor(
    private elementRef: ElementRef,
    private aboutService: AboutService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.hasBeenVisible) {
          this.setFirstVisibility();
        }
      },
      { threshold: 0.1 }
    );

    if (this.elementRef.nativeElement) {
      this.observer.observe(this.elementRef.nativeElement);
    }
  }

  private startAnimation() {
    const delay = 1000;
    this.animationExampleCanvasTimeout = setTimeout(() => {
      this.startAnimationExampleCanvas();
    }, delay);

    this.animationBinaryTimeout = setTimeout(() => {
      this.startAnimationBinary();
    }, delay + 2500);

    this.animationExampleResponseTimeout = setTimeout(() => {
      this.startAnimationResponseCanvas();
    }, delay + 25000);
  }

  private startAnimationExampleCanvas() {
    const canvasElement = this.elementRef.nativeElement.querySelector(
      '.example-canvas-animation'
    );
    console.log(canvasElement);
    if (canvasElement) {
      this.renderer.addClass(canvasElement, 'animate');
    }
  }

  private startAnimationBinary() {
    const binaryElement =
      this.elementRef.nativeElement.querySelector('.binary-animation');
    if (binaryElement) {
      this.renderer.addClass(binaryElement, 'animate');
    }
  }

  private startAnimationResponseCanvas() {
    const canvasElement =
      this.elementRef.nativeElement.querySelector('.example-response');
    if (canvasElement) {
      this.renderer.addClass(canvasElement, 'animate');
    }
  }

  private setFirstVisibility() {
    this.hasBeenVisible = true;
    this.aboutService.setComponentVisibility(true);
    this.startAnimation();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.animationExampleCanvasTimeout) {
      clearTimeout(this.animationExampleCanvasTimeout);
    }
    if (this.animationBinaryTimeout) {
      clearTimeout(this.animationBinaryTimeout);
    }
    if (this.animationExampleResponseTimeout) {
      clearTimeout(this.animationExampleResponseTimeout);
    }
  }
}
