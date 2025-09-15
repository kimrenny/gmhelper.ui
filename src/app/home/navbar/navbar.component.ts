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
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [TranslateModule, RouterModule],
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  activeSection: string = 'welcome';
  userClicked: boolean = false;
  lastScrollY: number = 0;
  isHomeComponentActive: boolean = false;
  private boundOnScroll = this.onScroll.bind(this);

  constructor(
    private navigationService: NavigationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.navigationService.activeSection$.subscribe((section) => {
      this.activeSection = section;
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = this.router.url;
        const hasSection = this.navigationService.sections.some((section) =>
          url.includes(`section=${section}`)
        );
        this.isHomeComponentActive = url === '/' || hasSection;

        if (!this.isHomeComponentActive) {
          this.activeSection = '';
        }
      });

    this.route.queryParams.subscribe((params) => {
      const section = params['section'];
      if (section && this.navigationService.sections.includes(section)) {
        setTimeout(
          () => this.navigationService.scrollToSection(section, false),
          100
        );
      }
    });

    window.addEventListener('wheel', (e) => this.onScroll(e), {
      passive: false,
    });
  }

  scrollToSection(section: string) {
    this.userClicked = true;
    this.navigationService.scrollToSection(section);
    setTimeout(() => {
      this.userClicked = false;
    }, 1000);
  }

  ngOnDestroy() {
    window.removeEventListener('wheel', (e) => this.onScroll(e));
  }

  onScroll(event: WheelEvent) {
    if (!this.isHomeComponentActive) return;

    if (event.ctrlKey) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    if (this.userClicked) return;
    if (this.navigationService.isScrolling()) return;

    const direction = event.deltaY > 0 ? 'down' : 'up';

    this.navigationService.scrollToNext(direction);
  }
}
