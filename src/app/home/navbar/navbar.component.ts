import { Component, AfterViewInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [TranslateModule],
})
export class NavbarComponent implements AfterViewInit {
  activeSection: string = 'welcome';
  userClicked: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.initSmoothScroll();
    this.initRouteListener();
    this.setActiveSection();
  }

  private initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const href = (event.currentTarget as HTMLAnchorElement).getAttribute(
          'href'
        );
        if (href) {
          const targetId = href.substring(1);

          if (this.router.url !== '/') {
            this.router.navigate(['/'], { fragment: targetId }).then(() => {
              this.scrollToSection(targetId);
            });
          } else {
            this.scrollToSection(targetId);
            this.updateURL(targetId);
          }

          this.userClicked = true;
        }
      });
    });
  }

  private initRouteListener() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment && !this.userClicked) {
        this.scrollToSection(fragment);
      }
    });
  }

  private setActiveSection() {
    if (this.userClicked) return;

    const sections = document.querySelectorAll('section');

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id') || 'welcome';
          if (this.activeSection !== sectionId) {
            this.activeSection = sectionId;
            this.updateURL(sectionId);
          }
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  private updateURL(sectionId: string) {
    this.router.navigate([], {
      queryParams: { section: sectionId },
      replaceUrl: true,
    });
  }

  private scrollToSection(sectionId: string) {
    const targetElement = document.getElementById(sectionId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      this.activeSection = sectionId;

      this.cdr.detectChanges();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.userClicked) {
      this.setActiveSection();
    }
  }
}
