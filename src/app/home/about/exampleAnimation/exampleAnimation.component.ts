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
  private restartTimeout: any;

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
    const delay = 15000;
    const firstAnimationDelay = 2500 + delay;
    const secondAnimationDelay = firstAnimationDelay + 17500;

    this.animationExampleCanvasTimeout = setTimeout(() => {
      this.startAnimationExampleCanvas();
    }, delay);

    this.animationBinaryTimeout = setTimeout(() => {
      this.startAnimationBinary();
    }, firstAnimationDelay);

    this.animationExampleResponseTimeout = setTimeout(() => {
      this.startAnimationResponseCanvas();
    }, secondAnimationDelay);

    const totalDuration = secondAnimationDelay + 7500 + 40000;
    this.restartTimeout = setTimeout(() => {
      this.resetAnimations();
      this.startAnimation();
    }, totalDuration);
  }

  private resetAnimations() {
    const elements = this.elementRef.nativeElement.querySelectorAll(
      '.example-canvas-animation, .binary-animation, .example-response'
    );

    elements.forEach((element: HTMLElement) => {
      this.renderer.removeClass(element, 'animate');
    });
  }

  private startAnimationExampleCanvas() {
    const canvasElement = this.elementRef.nativeElement.querySelector(
      '.example-canvas-animation'
    );
    const neonLine =
      this.elementRef.nativeElement.querySelector('.neon-canvas');
    if (canvasElement && neonLine) {
      this.renderer.addClass(canvasElement, 'animate');
      this.renderer.setStyle(neonLine, 'animation-play-state', 'running');
    }
  }

  private startAnimationBinary() {
    const binaryElement =
      this.elementRef.nativeElement.querySelector('.binary-animation');
    const neonLine =
      this.elementRef.nativeElement.querySelector('.neon-response');
    if (binaryElement && neonLine) {
      this.renderer.addClass(binaryElement, 'animate');
      this.renderer.setStyle(neonLine, 'animation-play-state', 'running');
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
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
  }
}
