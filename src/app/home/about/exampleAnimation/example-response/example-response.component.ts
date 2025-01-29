import {
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutService } from 'src/app/services/about.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-example-response',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example-response.component.html',
  styleUrls: ['./example-response.component.scss'],
})
export class ExampleResponseComponent {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLDivElement>;

  private shape: string | null = null;
  private dimensions: number[] = [];
  private task: string | null = null;
  private dimensionsPx: number[] = [];
  private drawingAllowedSubscription: Subscription;

  constructor(private renderer: Renderer2, private aboutService: AboutService) {
    this.drawingAllowedSubscription =
      this.aboutService.drawingResponseAllowed$.subscribe((isAllowed) => {
        if (isAllowed) {
          this.drawShape();
        } else {
          if (this.canvasRef) {
            this.clearCanvas(this.canvasRef.nativeElement);
          }
        }
      });
  }

  drawShape() {
    const canvas = this.canvasRef.nativeElement;
    this.clearCanvas(canvas);
    this.getShapeDetails();

    if (this.shape === 'triangle') {
      this.drawTriangle(canvas);
    } else if (this.shape === 'rectangle') {
      this.drawRectangle(canvas);
    }
  }

  getShapeDetails(): void {
    ({
      shape: this.shape,
      dimensions: this.dimensions,
      task: this.task,
      dimensionsPx: this.dimensionsPx,
    } = this.aboutService.getShapeDetails());
  }

  private clearCanvas(container: HTMLElement) {
    container.innerHTML = '';
  }

  private async drawTriangle(container: HTMLElement) {
    const base = this.dimensionsPx[0];
    const height = this.dimensionsPx[1];

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

  private async drawRectangle(container: HTMLElement) {
    const width = this.dimensionsPx[0];
    const height = this.dimensionsPx[1];

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
    this.dimensions = [side1, side2, side3, side4]
      .filter((side) => side !== undefined && side > 0)
      .map((side) => {
        if (side !== undefined) {
          return Math.round(side * scaleFactor);
        }
        return 0;
      });

    const [dim1, dim2, dim3, dim4] = this.dimensions;

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
            )}, BC = ${Math.round(dim2)}, ${this.task}`
          );
        }, delay);
        delay += 10000;

        setTimeout(() => {
          this.addSolution(container);
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
            `AB = CD = ${Math.round(dim1)}, BC = AD = ${Math.round(dim2)}, ${
              this.task
            }`
          );
        }, delay);
        delay += 10000;

        setTimeout(() => {
          this.addSolution(container);
        }, delay);
      }
    }
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

  private async addGivenText(container: HTMLElement, text: string) {
    const svg = container.querySelector('svg');
    if (!svg) return;

    const canvasWidth = parseInt(svg.getAttribute('width') || '300', 10);
    const lines = text.split(',');
    const startX = canvasWidth - 119;
    const startY = 40 - 1;
    const lineHeight = 20;
    let paddingY = 0;
    const lineWidth = lines.length === 4 ? 65 : 100;

    let delay = 1200;

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];

      if (index === lines.length - 1) {
        await this.delay(delay);
        this.addHorizontalLine(
          container,
          startX,
          startY + (index - 1) * lineHeight + 10,
          lineWidth
        );
        paddingY += 20;

        await this.delay(delay);
        this.addText(svg, line, startX, startY + index * lineHeight + paddingY);
      } else {
        await this.delay(delay);
        this.addText(svg, line, startX, startY + index * lineHeight);
      }
    }
  }

  private addText(svg: SVGElement, line: string, x: number, y: number) {
    const textElement = this.createSVGElement('text', {
      x: x.toString(),
      y: y.toString(),
      fill: 'black',
      'font-size': '16',
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
      }
    }, 100);
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

  private addSolution(container: HTMLElement) {
    const svg = container.querySelector('svg');
    if (!svg) return;

    const formulaCoords = {
      x: 21,
      y: 219,
    };
    const solutionCoords = {
      x: 21,
      y: 239,
    };
    const answerCoords = {
      x: 21,
      y: 259,
    };

    let formula = '';
    let solution = '';
    let answer = '';
    let calc: number;

    let delay = 500;

    if (this.shape === 'triangle') {
      if (this.task === 'S△ - ?') {
        calc = 0.5 * this.dimensions[0] * this.dimensions[2];
        formula = `S△ = 1/2 ab`;
        solution = `S△ = 1/2 * ${this.dimensions[0]} * ${this.dimensions[2]} = ${calc}`;
        answer = `S△ = ${calc}.`;
      } else if (this.task === 'P△ - ?') {
        calc = this.dimensions[0] + this.dimensions[1] + this.dimensions[2];
        formula = `P△ = a + b + c`;
        solution = `P△ = ${this.dimensions[0]} + ${this.dimensions[1]} + ${this.dimensions[2]} = ${calc}`;
        answer = `P△ = ${calc}`;
      }
    } else if (this.shape === 'rectangle') {
      if (this.task === 'S - ?') {
        calc = this.dimensions[0] * this.dimensions[1];
        formula = `S = ab`;
        solution = `S = ${this.dimensions[0]} * ${this.dimensions[1]} = ${calc}`;
        answer = `S = ${calc}.`;
      } else if (this.task === 'P - ?') {
        calc = 2 * (this.dimensions[0] + this.dimensions[1]);
        formula = `P = 2 * (a+b)`;
        solution = `P = 2 * (${this.dimensions[0]} + ${this.dimensions[1]}) = ${calc}`;
        answer = `P = ${calc}`;
      }
    }

    setTimeout(
      () => this.addText(svg, formula, formulaCoords.x, formulaCoords.y),
      delay
    );
    delay += 2500;
    setTimeout(
      () => this.addText(svg, solution, solutionCoords.x, solutionCoords.y),
      delay
    );
    delay += 4000;
    setTimeout(
      () => this.addText(svg, answer, answerCoords.x, answerCoords.y),
      delay
    );
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
