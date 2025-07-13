import {
  Component,
  AfterViewInit,
  HostListener,
  OnDestroy,
} from '@angular/core';
import {
  Router,
  RouterModule,
  ActivatedRoute,
  NavigationEnd,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [TranslateModule, RouterModule],
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  sections: string[] = ['welcome', 'about', 'features', 'contact', 'start'];
  activeSection: string = 'welcome';
  userClicked: boolean = false;
  scrolling: boolean = false;
  lastScrollY: number = 0;
  isHomeComponentActive: boolean = false;
  private boundOnScroll = this.onScroll.bind(this);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkHomeComponent();
      });

    this.route.queryParams.subscribe((params) => {
      const section = params['section'];
      if (section && this.sections.includes(section)) {
        setTimeout(() => this.scrollToSection(section, false), 100);
      }
    });

    document.body.style.overflow = 'hidden';

    window.addEventListener('wheel', this.boundOnScroll, {
      passive: false,
    });
  }

  ngOnDestroy() {
    window.removeEventListener('wheel', this.boundOnScroll);
  }

  private checkHomeComponent() {
    const url = this.router.url;
    const hasSection = this.sections.some((section) =>
      url.includes(`section=${section}`)
    );
    this.isHomeComponentActive = url === '/' || hasSection;
    if (!this.isHomeComponentActive) {
      this.activeSection = 'welcome';
    }
  }

  public scrollToSection(sectionId: string, updateUrl: boolean = true) {
    const targetElement = document.getElementById(sectionId);

    if (!targetElement) {
      const currentUrl = this.router.url;
      if (
        currentUrl.includes('settings') ||
        currentUrl.includes('register') ||
        currentUrl.includes('admin')
      ) {
        this.router.navigate(['']).then(() => {
          this.scrollToSection(sectionId, true);
        });
      }
    }

    if (targetElement) {
      this.scrolling = true;
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        this.scrolling = false;
        this.activeSection = sectionId;
        this.userClicked = false;
        this.cdr.detectChanges();

        if (updateUrl) {
          this.router.navigate([], {
            queryParams: { section: sectionId },
            replaceUrl: true,
          });
        }
      }, 500);
    }
  }

  private scrollToNextSection(direction: 'up' | 'down') {
    const currentIndex = this.sections.indexOf(this.activeSection);
    let nextIndex = currentIndex;

    if (direction === 'down' && currentIndex < this.sections.length - 1) {
      nextIndex++;
    } else if (direction === 'up' && currentIndex > 0) {
      nextIndex--;
    }

    if (nextIndex !== currentIndex) {
      this.scrollToSection(this.sections[nextIndex]);
    }
  }

  onScroll(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    if (this.scrolling) return;

    if (!this.isHomeComponentActive) return;

    const direction = event.deltaY > 0 ? 'down' : 'up';

    if (
      direction === 'down' &&
      this.activeSection === this.sections[this.sections.length - 1]
    )
      return;

    if (direction === 'up' && this.activeSection === this.sections[0]) return;

    this.scrollToNextSection(direction);
  }
}
