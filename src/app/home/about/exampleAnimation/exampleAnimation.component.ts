import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
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

  constructor(
    private elementRef: ElementRef,
    private aboutService: AboutService
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
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
