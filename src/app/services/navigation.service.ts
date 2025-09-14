import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  sections: string[] = ['welcome', 'about', 'features', 'roadmap', 'start'];
  activeSection$ = new BehaviorSubject<string>('welcome');
  private scrolling = false;

  constructor(private router: Router) {}

  scrollToSection(sectionId: string, updateUrl: boolean = true) {
    const el = document.getElementById(sectionId);
    if (!el) {
      this.router
        .navigate(['/'], { queryParams: { section: sectionId } })
        .then(() => {
          setTimeout(() => this.scrollToSection(sectionId, false), 500);
        });
      return;
    }

    this.scrolling = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
      this.scrolling = false;
      this.activeSection$.next(sectionId);

      if (updateUrl) {
        this.router.navigate([], {
          queryParams: { section: sectionId },
          replaceUrl: true,
        });
      }
    }, 500);
  }

  scrollToNext(direction: 'up' | 'down') {
    const idx = this.sections.indexOf(this.activeSection$.value);
    let next = idx;

    if (direction === 'down' && idx < this.sections.length - 1) next++;
    if (direction === 'up' && idx > 0) next--;

    if (next !== idx) this.scrollToSection(this.sections[next]);
  }

  isScrolling() {
    return this.scrolling;
  }
}
