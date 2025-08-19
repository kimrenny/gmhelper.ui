import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-settings-app',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss'],
})
export class LanguageSettingsComponent {
  selectedLanguage: 'de' | 'en' | 'fr' | 'ja' | 'ko' | 'ru' | 'ua' | 'zh' =
    'en';
  selectedLanguageName: string = 'English';
  languages = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'ru', name: 'Русский' },
    { code: 'ua', name: 'Українська' },
    { code: 'zh', name: '中文' },
  ];
  isDropdownOpen = false;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectLanguage(lang: { code: string; name: string }) {
    this.selectedLanguage = lang.code as
      | 'de'
      | 'en'
      | 'fr'
      | 'ja'
      | 'ko'
      | 'ru'
      | 'ua'
      | 'zh';
    this.selectedLanguageName = lang.name;
    this.isDropdownOpen = false;
  }

  saveLanguage() {
    this.userService.updateLanguage(this.selectedLanguage).subscribe({
      next: () => {
        this.toastr.success(
          this.translate.instant('SETTINGS.SUCCESS.MESSAGE'),
          this.translate.instant('SETTINGS.SUCCESS.TITLE')
        );
      },
      error: (err) => {
        console.error('Error: ', err);
        this.toastr.error(
          this.translate.instant('SETTINGS.ERROR.MESSAGE'),
          this.translate.instant('SETTINGS.ERROR.TITLE')
        );
      },
    });
  }
}
