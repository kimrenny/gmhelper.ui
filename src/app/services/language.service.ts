import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from './user.service';
import { LanguageCode } from '../models/languages.model';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  constructor(
    private translate: TranslateService,
    private userService: UserService
  ) {}

  initializeLanguage(): void {
    const language = this.userService.getUserDetails().language || 'en';

    this.translate.use(this.isLanguageCode(language) ? language : 'en');
  }

  updateLanguageFromUser(userLang: string): boolean {
    if (this.isLanguageCode(userLang)) {
      this.setLanguage(userLang);
      return true;
    }

    return false;
  }

  private setLanguage(lang: string): void {
    this.translate.use(lang);
  }

  isLanguageCode(code: string): code is LanguageCode {
    return ['de', 'en', 'fr', 'ja', 'ko', 'ru', 'ua', 'zh'].includes(code);
  }
}
