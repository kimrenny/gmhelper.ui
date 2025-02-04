import { Component, AfterViewInit, OnDestroy } from '@angular/core';
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
  selector: 'app-admin-nav',
  standalone: true,
  templateUrl: './admin-navigation.component.html',
  styleUrls: ['./admin-navigation.component.scss'],
  imports: [TranslateModule, RouterModule],
})
export class AdminNavComponent implements AfterViewInit, OnDestroy {
  sections: string[] = ['dashboard', 'users', 'tokens', 'logs', 'settings'];
  activeSection: string = 'dashboard';
  userClicked: boolean = false;
  scrolling: boolean = false;
  lastScrollY: number = 0;
  private boundOnScroll = this.onScroll.bind(this);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
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

  public scrollToSection(sectionId: string, updateUrl: boolean = true) {
    const targetElement = document.getElementById(sectionId);

    if (!targetElement) {
      this.router.navigate(['admin']).then(() => {
        this.scrollToSection(sectionId, true);
      });
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
          const currentUrl = this.router.url.split('?')[0];

          this.router.navigateByUrl(`${currentUrl}?section=${sectionId}`);
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
    event.preventDefault();

    if (this.scrolling) return;

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
