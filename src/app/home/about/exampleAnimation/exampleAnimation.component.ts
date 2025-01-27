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

  private setFirstVisibility() {
    this.hasBeenVisible = true;
    this.aboutService.setComponentVisibility(true);
    this.startAnimation();
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
    const neonElement =
      this.elementRef.nativeElement.querySelector('.neon-canvas');

    if (canvasElement && neonElement) {
      this.renderer.addClass(canvasElement, 'animate');

      setTimeout(() => {
        this.renderer.addClass(neonElement, 'neon-visible');

        setTimeout(() => {
          this.createSquares(neonElement);
        }, 2500);
      }, 0);

      setTimeout(() => {
        this.renderer.removeClass(neonElement, 'neon-visible');
      }, 10000);
    }
  }

  private startAnimationBinary() {
    const binaryElement =
      this.elementRef.nativeElement.querySelector('.binary-animation');

    const neonElement =
      this.elementRef.nativeElement.querySelector('.neon-response');

    if (binaryElement && neonElement) {
      this.renderer.addClass(binaryElement, 'animate');

      setTimeout(() => {
        this.renderer.addClass(neonElement, 'neon-visible');

        setTimeout(() => {
          this.createSquares(neonElement);
        }, 2500);
      }, 15000);

      setTimeout(() => {
        this.renderer.removeClass(neonElement, 'neon-visible');
      }, 25000);
    }
  }

  private startAnimationResponseCanvas() {
    const canvasElement =
      this.elementRef.nativeElement.querySelector('.example-response');
    if (canvasElement) {
      this.renderer.addClass(canvasElement, 'animate');
    }
  }

  private createSquares(neonElement: HTMLElement) {
    const totalDuration = 7500;
    const maxDelay = 500;
    const minDelay = 100;
    const createSquareDelay = 150;

    const createSquare = () => {
      const square = this.renderer.createElement('div');

      this.renderer.setStyle(square, 'position', 'absolute');
      this.renderer.setStyle(square, 'width', '5px');
      this.renderer.setStyle(square, 'height', '5px');
      this.renderer.setStyle(square, 'background-color', '#ffffff');

      const top = Math.random() * 300 + 110;
      this.renderer.setStyle(square, 'top', `${top}px`);
      this.renderer.setStyle(square, 'left', '0px');
      this.renderer.addClass(square, 'square');

      const randomX = Math.random() * 150 + 100;
      const randomY =
        Math.random() < 0.5 ? -(Math.random() * 150) : Math.random() * 150;

      const delay = Math.random() * (maxDelay - minDelay) + minDelay;

      this.renderer.appendChild(neonElement, square);

      this.renderer.setStyle(square, 'transition', 'transform 1s ease-out');
      setTimeout(() => {
        this.renderer.setStyle(
          square,
          'transform',
          `translate(-${randomX}px, ${randomY}px)`
        );
      }, 0);

      setTimeout(() => {
        this.renderer.removeChild(neonElement, square);
      }, delay + 1000);
    };

    const createSquaresBatch = () => {
      const squareCount = Math.random() * 5 + 5;
      for (let i = 0; i < squareCount; i++) {
        createSquare();
      }
    };

    const createSquareInterval = setInterval(
      createSquaresBatch,
      createSquareDelay
    );

    setTimeout(() => {
      clearInterval(createSquareInterval);
    }, totalDuration);
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
