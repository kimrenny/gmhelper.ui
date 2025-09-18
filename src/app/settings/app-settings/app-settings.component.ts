import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import {
  Language,
  LanguageCode,
  languages,
} from 'src/app/models/languages.model';
import { LanguageService } from 'src/app/services/language.service';
import { UserService } from 'src/app/services/user.service';
import { Store } from '@ngrx/store';
import * as UserState from '../../store/user/user.state';
import * as UserSelectors from '../../store/user/user.selectors';
import * as UserActions from '../../store/user/user.actions';

@Component({
  selector: 'app-settings-app',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss'],
})
export class LanguageSettingsComponent implements OnInit {
  selectedLanguage: LanguageCode = 'en';
  selectedLanguageName: string = 'English';
  isDropdownOpen = false;
  languages = languages;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private store: Store<UserState.UserState>
  ) {}

  ngOnInit(): void {
    this.store.select(UserSelectors.selectUser).subscribe((user) => {
      if (!user) return;

      const langCode = user.language.toLowerCase();
      if (this.languageService.isLanguageCode(langCode)) {
        const langObj = languages.find((l) => l.code === langCode)!;
        this.selectedLanguage = langObj.code;
        this.selectedLanguageName = langObj.name;
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectLanguage(lang: Language) {
    this.selectedLanguage = lang.code;
    this.selectedLanguageName = lang.name;
    this.isDropdownOpen = false;
  }

  saveLanguage() {
    this.store.dispatch(
      UserActions.updateUserLanguage({ language: this.selectedLanguage })
    );
    this.toastr.success(
      this.translate.instant('SETTINGS.SUCCESS.MESSAGE'),
      this.translate.instant('SETTINGS.SUCCESS.TITLE')
    );
  }
}
