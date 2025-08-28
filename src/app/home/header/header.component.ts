import {
  Component,
  HostListener,
  OnInit,
  ChangeDetectorRef,
  Inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart, RouterModule } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { TokenService } from 'src/app/services/token.service';
import { LanguageService } from 'src/app/services/language.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderService } from 'src/app/services/header.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, RouterModule, TranslateModule],
})
export class HeaderComponent implements OnInit, OnDestroy {
  showLanguageMenu = false;
  userIsAuthenticated = false;
  userAvatarUrl = 'assets/icons/default-avatar.png';
  userNickname = 'Guest';
  userRole: string | null = 'Guest';
  showUserMenu = false;
  isUserLoading = false;

  showAuthHighlight = true;

  private subscriptions = new Subscription();

  constructor(
    @Inject(UserService) private userService: UserService,
    private tokenService: TokenService,
    private headerService: HeaderService,
    private languageService: LanguageService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    const authSub = this.userService.isAuthorized$.subscribe(
      (isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      }
    );

    const userSub = this.userService.user$.subscribe((userDetails) => {
      this.userNickname = userDetails.nickname;
      this.userAvatarUrl =
        userDetails.avatar || 'assets/icons/default-avatar.png';
    });

    const routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && event.url === '/') {
        this.showUserMenu = false;
      }
    });

    const roleSub = this.tokenService.userRole$.subscribe((role) => {
      this.userRole = role;
    });

    const loadingSub = this.userService.isUserLoading$.subscribe(
      (isLoading) => {
        this.isUserLoading = isLoading;
      }
    );

    const highlightSub = this.headerService.showAuthHighlight$.subscribe(
      (showHighlight) => {
        this.showAuthHighlight = showHighlight;
      }
    );

    this.subscriptions.add(authSub);
    this.subscriptions.add(userSub);
    this.subscriptions.add(routerSub);
    this.subscriptions.add(roleSub);
    this.subscriptions.add(loadingSub);
    this.subscriptions.add(highlightSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  toggleLanguageMenu() {
    this.showLanguageMenu = !this.showLanguageMenu;
  }

  selectLanguage(language: string) {
    const result = this.languageService.updateLanguageFromUser(language);
    this.showLanguageMenu = false;

    if (result) {
      this.toastr.info(
        this.translate.instant('LANGUAGE.TEMPORARY_MESSAGE'),
        this.translate.instant('LANGUAGE.CHANGE_TITLE'),
        { timeOut: 5000 }
      );
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    const languageMenu = document.querySelector('.language-dropdown');
    const userMenu = document.querySelector('.user-menu');

    if (languageMenu && !languageMenu.contains(targetElement)) {
      this.showLanguageMenu = false;
    }

    if (userMenu && !userMenu.contains(targetElement)) {
      this.showUserMenu = false;
    }
  }

  navigateToRegistration(type: 'signup' | 'login') {
    this.router.navigate(['/register'], { queryParams: { type } });
  }

  logout() {
    this.userService.clearUser();
    this.showUserMenu = false;
    this.router.navigate(['/login']);
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  openUserSettings() {
    this.showUserMenu = false;
    this.router.navigate(['/settings']);
  }

  openAdminPanel() {
    if (!this.checkAdminAccess()) return;

    this.showUserMenu = false;
    this.router.navigate(['/admin']);
  }

  checkAdminAccess() {
    return this.userRole === 'Admin' || this.userRole === 'Owner'
      ? true
      : false;
  }
}
