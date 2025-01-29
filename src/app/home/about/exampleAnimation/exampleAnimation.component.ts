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

  private timeouts: any[] = [];

  private isAnimating: boolean = false;

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

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.clearAllTimeouts();
      this.resetAnimations();
    } else {
      this.hasBeenVisible = false;
      this.restartAnimation();
    }
  };

  private setFirstVisibility() {
    if (this.hasBeenVisible) return;

    this.hasBeenVisible = true;
    this.startAnimation();
  }

  private startAnimation() {
    this.clearAllTimeouts();

    const delay = 15000;
    const firstAnimationDelay = 2500 + delay;
    const secondAnimationDelay = firstAnimationDelay + 17500;

    this.aboutService.setComponentVisibility(true);

    this.timeouts.push(
      setTimeout(() => {
        this.startAnimationExampleCanvas();
      }, delay)
    );

    this.timeouts.push(
      setTimeout(() => {
        this.startAnimationBinary();
      }, firstAnimationDelay)
    );

    this.timeouts.push(
      setTimeout(() => {
        this.startAnimationResponseCanvas();
      }, secondAnimationDelay)
    );

    const totalDuration = secondAnimationDelay + 7500 + 40000;
    this.timeouts.push(
      setTimeout(() => {
        this.restartAnimation();
      }, totalDuration)
    );
  }

  private restartAnimation() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.clearAllTimeouts();
    this.resetAnimations();

    setTimeout(() => {
      this.isAnimating = false;
      this.startAnimation();
    }, 100);
  }

  private clearAllTimeouts() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }

  private resetAnimations() {
    const elements = this.elementRef.nativeElement.querySelectorAll(
      '.example-canvas-animation, .binary-animation, .example-response, .neon-canvas, .neon-response'
    );

    elements.forEach((element: HTMLElement) => {
      this.renderer.removeClass(element, 'animate');
      this.renderer.removeClass(element, 'neon-visible');
    });

    this.aboutService.setComponentVisibility(false);
    this.aboutService.setDrawingResponseAllowed(false);
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
      }, 12500);
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
      }, 28000);
    }
  }

  private startAnimationResponseCanvas() {
    const canvasElement =
      this.elementRef.nativeElement.querySelector('.example-response');
    if (canvasElement) {
      this.renderer.addClass(canvasElement, 'animate');
    }

    setTimeout(() => {
      this.aboutService.setDrawingResponseAllowed(true);
    }, 8500);
  }

  private createSquares(neonElement: HTMLElement) {
    const totalDuration = 7500;
    const maxDelay = 500;
    const minDelay = 100;
    const createSquareDelay = 150;
    const paddingY = 15;

    const createSquare = () => {
      const square = this.renderer.createElement('div');

      this.renderer.setStyle(square, 'position', 'absolute');
      this.renderer.setStyle(square, 'width', '5px');
      this.renderer.setStyle(square, 'height', '5px');
      this.renderer.setStyle(square, 'background-color', '#ffffff');

      const top = Math.random() * 320;
      this.renderer.setStyle(square, 'top', `${top}px`);
      this.renderer.setStyle(square, 'left', '0px');

      const randomX = Math.random() * 150;
      const randomY =
        Math.random() > 0.5
          ? -(Math.random() * top - paddingY)
          : Math.random() * (320 - top - paddingY);

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
    this.clearAllTimeouts();

    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );
  }
}
