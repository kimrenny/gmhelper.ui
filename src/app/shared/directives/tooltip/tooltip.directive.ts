import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipKey!: string;

  private tooltipElement: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private translate: TranslateService
  ) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    if (this.tooltipElement) return;

    const tooltipText = this.translate.instant(this.tooltipKey);

    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'tooltip-text');
    this.renderer.addClass(this.tooltipElement, 'top');

    const text = this.renderer.createText(tooltipText);
    this.renderer.appendChild(this.tooltipElement, text);

    this.renderer.appendChild(this.el.nativeElement, this.tooltipElement);
    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
        this.renderer.setStyle(this.tooltipElement, 'visibility', 'visible');
        this.renderer.setStyle(
          this.tooltipElement,
          'transform',
          'translateY(0)'
        );
      }
    }, 10);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.tooltipElement) {
      this.renderer.removeChild(this.el.nativeElement, this.tooltipElement);
      this.tooltipElement = null;
    }
  }

  ngOnDestroy() {
    if (this.tooltipElement) {
      this.renderer.removeChild(this.el.nativeElement, this.tooltipElement);
    }
  }
}
