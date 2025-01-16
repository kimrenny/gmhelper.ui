import { Component, AfterViewInit, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-stars',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-stars.component.html',
  styleUrls: ['./welcome-stars.component.scss'],
})
export class WelcomeStarsComponent implements AfterViewInit {
  private starCount = 300;
  private stars: HTMLElement[] = [];
  private starPositions: { x: number; y: number }[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private lastMouseMove = 0;
  private debounceDelay = 0;

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngAfterViewInit() {
    this.createStars();
    this.setupCursorConnection();
  }

  private createStars() {
    const starsContainer = this.renderer.selectRootElement('#stars');
    if (!starsContainer) {
      console.error('Stars container not found!');
      return;
    }

    for (let i = 0; i < this.starCount; i++) {
      const star = this.renderer.createElement('div');
      const size = Math.random() * 3 + 1;
      const hue = Math.random();
      const delay = Math.random() * 5;

      this.renderer.addClass(star, 'star');
      this.renderer.setStyle(star, 'width', `${size}px`);
      this.renderer.setStyle(star, 'height', `${size}px`);
      this.renderer.setStyle(star, 'left', `${Math.random() * 100}vw`);
      this.renderer.setStyle(star, 'top', `${Math.random() * 100}vh`);
      this.renderer.setStyle(star, 'hue', hue.toString());
      this.renderer.setStyle(star, 'animation-delay', `${delay}s`);

      this.renderer.appendChild(starsContainer, star);
      this.stars.push(star);

      const rect = star.getBoundingClientRect();
      this.starPositions.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    this.canvas = this.renderer.createElement('canvas');
    this.context = this.canvas!.getContext('2d');
    if (this.canvas && this.context) {
      this.renderer.appendChild(starsContainer, this.canvas);
      this.updateCanvasSize();
    }
  }

  private setupCursorConnection() {
    this.renderer.listen('document', 'mousemove', (event: MouseEvent) => {
      const currentTime = Date.now();
      if (currentTime - this.lastMouseMove < this.debounceDelay) {
        return;
      }
      this.lastMouseMove = currentTime;

      this.drawConstellations(event.clientX, event.clientY);
    });

    this.renderer.listen('document', 'mouseleave', () => {
      this.clearConstellations();
    });
  }

  private updateCanvasSize() {
    if (this.canvas && this.context) {
      const starsContainer = this.el.nativeElement.querySelector('#stars');
      this.canvas.width = starsContainer.offsetWidth;
      this.canvas.height = starsContainer.offsetHeight;
    }
  }

  private drawConstellations(mouseX: number, mouseY: number) {
    if (!this.context) return;

    this.context.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

    const distances: { star: HTMLElement; distance: number }[] = [];
    this.starPositions.forEach((pos, index) => {
      const distance = Math.sqrt(
        Math.pow(mouseX - pos.x, 2) + Math.pow(mouseY - pos.y, 2)
      );
      if (distance < 100) {
        distances.push({ star: this.stars[index], distance });
      }
    });

    distances.sort((a, b) => a.distance - b.distance);
    const closestStars = distances.slice(0, 4);

    closestStars.forEach(({ star }) => {
      const rect = star.getBoundingClientRect();
      const starX = rect.left + rect.width / 2;
      const starY = rect.top + rect.height / 2;

      this.context!.beginPath();
      this.context!.moveTo(mouseX, mouseY);
      this.context!.lineTo(starX, starY);
      this.context!.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      this.context!.lineWidth = 1;
      this.context!.stroke();
    });
  }

  private clearConstellations() {
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
    }
  }
}
