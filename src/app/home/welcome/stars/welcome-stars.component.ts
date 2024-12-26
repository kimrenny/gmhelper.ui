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
      const size = Math.random() * 3 + 1; // Размер от 1 до 4 пикселей
      const hue = Math.random(); // Случайный оттенок для звезды
      const delay = Math.random() * 5; // Случайная задержка до 5 секунд

      this.renderer.addClass(star, 'star');
      this.renderer.setStyle(star, 'width', `${size}px`);
      this.renderer.setStyle(star, 'height', `${size}px`);
      this.renderer.setStyle(star, 'left', `${Math.random() * 100}vw`);
      this.renderer.setStyle(star, 'top', `${Math.random() * 100}vh`);
      this.renderer.setStyle(star, 'hue', hue.toString());
      this.renderer.setStyle(star, 'animation-delay', `${delay}s`); // Задержка анимации

      this.renderer.appendChild(starsContainer, star);
      this.stars.push(star); // Сохраняем ссылки на звезды
    }
  }

  private setupCursorConnection() {
    const starsContainer = this.el.nativeElement.querySelector('#stars');

    this.renderer.listen('document', 'mousemove', (event: MouseEvent) => {
      this.drawConstellations(event.clientX, event.clientY, starsContainer);
    });

    this.renderer.listen('document', 'mouseleave', () => {
      this.clearConstellations(starsContainer);
    });
  }

  private drawConstellations(
    mouseX: number,
    mouseY: number,
    container: HTMLElement
  ) {
    // Очищаем старые линии
    this.clearConstellations(container);

    // Создаем канвас для рисования линий
    const canvas = this.renderer.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    // Устанавливаем размер канваса
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    this.renderer.appendChild(container, canvas);

    const distances: { star: HTMLElement; distance: number }[] = [];

    // Обходим звезды и проверяем расстояние до курсора
    this.stars.forEach((star) => {
      const rect = star.getBoundingClientRect();
      const starX = rect.left + rect.width / 2;
      const starY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(mouseX - starX, 2) + Math.pow(mouseY - starY, 2)
      );

      if (distance < 100) {
        // Если курсор близко к звезде
        distances.push({ star, distance });
      }
    });

    // Сортируем звезды по расстоянию и берем только 4 ближайшие
    distances.sort((a, b) => a.distance - b.distance);
    const closestStars = distances.slice(0, 4);

    // Рисуем линии к ближайшим звездам
    closestStars.forEach(({ star }) => {
      const rect = star.getBoundingClientRect();
      const starX = rect.left + rect.width / 2;
      const starY = rect.top + rect.height / 2;

      context.beginPath();
      context.moveTo(mouseX, mouseY);
      context.lineTo(starX, starY);
      context.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // Цвет линии
      context.lineWidth = 1;
      context.stroke();
    });
  }

  private clearConstellations(container: HTMLElement) {
    const canvas = container.querySelector('canvas');
    if (canvas) {
      this.renderer.removeChild(container, canvas);
    }
  }
}
