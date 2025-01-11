import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { CommonModule, NumberSymbol } from '@angular/common';

@Component({
  selector: 'app-example-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example-canvas.component.html',
  styleUrls: ['./example-canvas.component.scss'],
})
export class ExampleCanvasComponent {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLDivElement>;

  private shapes = ['triangle', 'rectangle'];
  private triangleTasks = ['S△ - ?', 'P△ - ?'];
  private rectangleTasks = ['S - ?', 'P - ?'];
  private drawnShape: string | null = null;

  public givenCondition: string = '';

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.drawRandomShape();
  }

  drawRandomShape() {
    const canvas = this.canvasRef.nativeElement;
    this.drawnShape =
      this.shapes[Math.floor(Math.random() * this.shapes.length)];

    if (this.drawnShape === 'triangle') {
      this.drawTriangle(canvas);
    } else if (this.drawnShape === 'rectangle') {
      this.drawRectangle(canvas);
    }
  }

  private drawTriangle(container: HTMLElement) {
    const base = Math.floor(Math.random() * 60) + 60;
    const height = Math.floor(Math.random() * 60) + 60;

    const paddingX = 40;
    const paddingY = 40;

    const topX = 0 + paddingX;
    const topY = 0 + paddingY;

    const leftX = 0 + paddingX;
    const leftY = height + paddingY;

    const rightX = base + paddingX;
    const rightY = height + paddingY;

    const leftSide = height;
    const rightSide = Math.sqrt(
      Math.pow(topX - rightX, 2) + Math.pow(topY - rightY, 2)
    );
    const bottomSide = base;

    const perimeter = leftSide + rightSide + bottomSide;

    const svg = this.createSVGElement('polygon', {
      points: `${topX},${topY} ${leftX},${leftY} ${rightX},${rightY}`,
      stroke: '#000',
      fill: 'transparent',
      'stroke-width': '3',
      'stroke-dasharray': perimeter.toString(),
      'stroke-dashoffset': perimeter.toString(),
    });

    this.appendShape(svg, container);

    setTimeout(() => {
      this.addDimensions(container, leftSide, rightSide, bottomSide);
    }, 2500);
  }

  private drawRectangle(container: HTMLElement) {
    const width = Math.floor(Math.random() * 60) + 60;
    const height = Math.floor(Math.random() * 60) + 60;

    const perimeter = 2 * (width + height);

    const paddingX = 40;
    const paddingY = 40;

    const svg = this.createSVGElement('rect', {
      x: paddingX.toString(),
      y: paddingY.toString(),
      width: width.toString(),
      height: height.toString(),
      stroke: '#000',
      fill: 'transparent',
      'stroke-width': '3',
      'stroke-dasharray': perimeter.toString(),
      'stroke-dashoffset': perimeter.toString(),
    });

    this.appendShape(svg, container);

    setTimeout(() => {
      this.addDimensions(container, width, height, width, height);
    }, 2500);
  }

  private createSVGElement(
    tag: string,
    attributes: Record<string, string>
  ): SVGElement {
    const el = this.renderer.createElement(tag, 'svg');
    for (const [key, value] of Object.entries(attributes)) {
      this.renderer.setAttribute(el, key, value);
    }
    return el;
  }

  private appendShape(shape: SVGElement, container: HTMLElement) {
    const width = 300;
    const height = 300;
    const svg = this.renderer.createElement('svg', 'svg');
    this.renderer.setAttribute(svg, 'viewBox', `0 0 ${width} ${height}`);
    this.renderer.setAttribute(svg, 'width', '300');
    this.renderer.setAttribute(svg, 'height', '300');
    this.renderer.appendChild(svg, shape);
    this.renderer.appendChild(container, svg);
  }

  private addDimensions(
    container: HTMLElement,
    side1: number,
    side2: number,
    side3: number,
    side4?: number
  ) {
    const scaleFactor = 1 / 16;
    const dimensions = [side1, side2, side3, side4]
      .filter((side) => side !== undefined && side > 0)
      .map((side) => {
        if (side !== undefined) {
          return Math.round(side * scaleFactor);
        }
        return 0;
      });

    const [dim1, dim2, dim3, dim4] = dimensions;

    if (container) {
      let delay = 0;
      const padding = 10;

      if (dim4 == undefined || dim4 == 0) {
        setTimeout(
          () => this.addVertexLabel(container, -padding, side1 + padding, 'A'),
          delay
        );
        delay += 500;
        setTimeout(
          () => this.addVertexLabel(container, -padding, -padding, 'B'),
          delay
        );
        delay += 500;
        setTimeout(
          () =>
            this.addVertexLabel(
              container,
              side3 + padding,
              side1 + padding,
              'C'
            ),
          delay
        );
        delay += 1000;

        setTimeout(
          () => this.addSideLengthLabel(container, -padding, side1 / 2, dim1),
          delay
        );
        delay += 500;
        setTimeout(
          () =>
            this.addSideLengthLabel(
              container,
              side3 / 2,
              side1 + padding,
              dim3
            ),
          delay
        );
        delay += 500;
        setTimeout(
          () =>
            this.addSideLengthLabel(
              container,
              side3 / 2 + padding,
              side1 / 2 - padding,
              dim2
            ),
          delay
        );
        delay += 500;
        setTimeout(() => {
          this.addGivenText(
            container,
            `AB = ${Math.round(dim1)}, AC = ${Math.round(
              dim3
            )}, BC = ${Math.round(dim2)}, ${this.generateTask('triangle')}`
          );
        }, delay);
      } else {
        setTimeout(
          () => this.addVertexLabel(container, -padding, -padding, 'A'),
          delay
        );
        delay += 500;
        setTimeout(
          () => this.addVertexLabel(container, side1 + padding, -padding, 'B'),
          delay
        );
        delay += 500;
        setTimeout(
          () =>
            this.addVertexLabel(
              container,
              side1 + padding,
              side2 + padding,
              'C'
            ),

          delay
        );
        delay += 500;
        setTimeout(
          () => this.addVertexLabel(container, -padding, side2 + padding, 'D'),
          delay
        );
        delay += 500;

        setTimeout(
          () => this.addSideLengthLabel(container, side1 / 2, -padding, dim1),
          delay
        );
        delay += 500;
        setTimeout(
          () =>
            this.addSideLengthLabel(
              container,
              side1 + padding,
              side2 / 2,
              dim2
            ),
          delay
        );
        delay += 500;
        setTimeout(
          () =>
            this.addSideLengthLabel(
              container,
              side3 / 2,
              side2 + padding,
              dim3
            ),
          delay
        );
        delay += 500;
        setTimeout(
          () =>
            this.addSideLengthLabel(container, -padding, side2 / 2, dim4 || 0),
          delay
        );
        delay += 500;
        setTimeout(() => {
          this.addGivenText(
            container,
            `AB = CD = ${Math.round(dim1)}, BC = AD = ${Math.round(
              dim2
            )}, ${this.generateTask('rectangle')}`
          );
        }, delay);
      }
    }
  }

  private generateTask(shape: string) {
    if (shape == 'triangle')
      return this.triangleTasks[
        Math.floor(Math.random() * this.triangleTasks.length)
      ];
    if (shape == 'rectangle')
      return this.rectangleTasks[
        Math.floor(Math.random() * this.rectangleTasks.length)
      ];
    return;
  }

  private addVertexLabel(
    container: HTMLElement,
    x: number,
    y: number,
    label: string
  ) {
    const svgContainer = container.querySelector('svg');
    if (svgContainer) {
      const labelElement = this.renderer.createElement('text', 'svg');
      this.renderer.setAttribute(labelElement, 'x', (x + 40).toString());
      this.renderer.setAttribute(labelElement, 'y', (y + 40).toString());
      this.renderer.setAttribute(labelElement, 'fill', '#000');
      labelElement.textContent = label;
      this.renderer.setAttribute(labelElement, 'font-size', '12');
      this.renderer.setAttribute(labelElement, 'text-anchor', 'middle');
      this.renderer.setAttribute(labelElement, 'dominant-baseline', 'central');
      this.renderer.setStyle(labelElement, 'position', 'absolute');

      this.renderer.appendChild(svgContainer, labelElement);
    }
  }

  private addSideLengthLabel(
    container: HTMLElement,
    x: number,
    y: number,
    dimension: number
  ) {
    const svgContainer = container.querySelector('svg');
    if (svgContainer) {
      const labelElement = this.renderer.createElement('text', 'svg');
      this.renderer.setAttribute(labelElement, 'x', (x + 40).toString());
      this.renderer.setAttribute(labelElement, 'y', (y + 40).toString());
      this.renderer.setAttribute(labelElement, 'fill', '#000');
      this.renderer.setAttribute(labelElement, 'font-size', '12');
      this.renderer.setAttribute(labelElement, 'text-anchor', 'middle');
      this.renderer.setAttribute(labelElement, 'dominant-baseline', 'central');
      this.renderer.setStyle(labelElement, 'position', 'absolute');

      let currentText = '';
      const textToAnimate = `${dimension}`;
      let index = 0;

      const intervalId = setInterval(() => {
        if (index < textToAnimate.length) {
          currentText += textToAnimate[index];
          labelElement.textContent = currentText;
          index++;
        } else {
          clearInterval(intervalId);
        }
      }, 100);
      this.renderer.appendChild(svgContainer, labelElement);
    }
  }

  private addGivenText(container: HTMLElement, text: string) {
    const svg = container.querySelector('svg');
    if (!svg) return;

    const canvasWidth = parseInt(svg.getAttribute('width') || '300', 10);
    const lines = text.split(',');
    const startX = canvasWidth - 100;
    const startY = 40;
    const lineHeight = 20;
    let paddingY = 0;

    let delay = 0;

    lines.forEach((line, index) => {
      setTimeout(() => {
        if (index === line.length - 1) {
        }
        const textElement = this.createSVGElement('text', {
          x: startX.toString(),
          y: (startY + index * lineHeight + paddingY).toString(),
          fill: 'black',
          'font-size': '14',
          'text-anchor': 'start',
          class: 'typewriter',
        });

        textElement.textContent = '';
        svg.appendChild(textElement);

        let charIndex = 0;
        const typingInterval = setInterval(() => {
          if (charIndex < line.length) {
            textElement.textContent += line[charIndex];
            charIndex++;
          } else {
            clearInterval(typingInterval);

            if (index === lines.length - 2) {
              setTimeout(() => {
                this.addHorizontalLine(
                  container,
                  startX,
                  startY + index * lineHeight + 10,
                  60
                );
              }, 1000);
              delay += 4000;
              paddingY += 10;
            }
          }
        }, 100);
      }, delay);

      delay += 1000;
    });
  }

  private addHorizontalLine(
    container: HTMLElement,
    x1: number,
    y1: number,
    lineWidth: number
  ) {
    const svg = container.querySelector('svg');
    if (svg) {
      const lineElement = this.renderer.createElement('line', 'svg');
      this.renderer.setAttribute(lineElement, 'x1', x1.toString());
      this.renderer.setAttribute(lineElement, 'y1', y1.toString());
      this.renderer.setAttribute(
        lineElement,
        'x2',
        (x1 + lineWidth).toString()
      );
      this.renderer.setAttribute(lineElement, 'y2', y1.toString());
      this.renderer.setAttribute(lineElement, 'stroke', 'black');
      this.renderer.setAttribute(lineElement, 'stroke-width', '3');
      this.renderer.setAttribute(lineElement, 'class', 'draw-line');
      this.renderer.appendChild(svg, lineElement);
    }
  }
}
