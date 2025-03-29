import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'user-lang';

  constructor(
    private translate: TranslateService,
    private userService: UserService
  ) {}

  initializeLanguage(): void {
    let language = localStorage.getItem(this.STORAGE_KEY);

    if (!language) {
      language = this.userService.getUserDetails().language || 'en';
      localStorage.setItem(this.STORAGE_KEY, language);
    }

    this.translate.setDefaultLang(language);
    this.translate.use(language);
  }

  setLanguage(lang: string): void {
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.translate.use(lang);
  }

  updateLanguageFromUser(userLang: string): void {
    const storedLang = localStorage.getItem(this.STORAGE_KEY);
    if (storedLang !== userLang) {
      this.setLanguage(userLang);
    }
  }
}
