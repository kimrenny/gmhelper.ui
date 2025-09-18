import { Component, OnInit } from '@angular/core';
import { WelcomeStarsComponent } from './stars/welcome-stars.component';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/services/user.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { Store } from '@ngrx/store';
import * as UserState from 'src/app/store/user/user.state';
import * as UserSelectors from 'src/app/store/user/user.selectors';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  imports: [CommonModule, WelcomeStarsComponent, TranslateModule],
})
export class WelcomeComponent implements OnInit {
  phrases: string[] = [];
  buttonPhrases: string[] = [];
  guestPhrases: string[] = [];
  currentText = '';
  buttonText = '';
  guestText = '';
  phraseIndex = 0;
  charIndex = 0;
  isDeleting = false;

  nickname: string | null = null;

  constructor(
    private translate: TranslateService,
    private store: Store<UserState.UserState>,
    private navigation: NavigationService
  ) {}

  ngOnInit(): void {
    this.store
      .select(UserSelectors.selectUser)
      .pipe(first())
      .subscribe((user) => {
        this.nickname =
          user.nickname && user.nickname !== 'Guest' ? user.nickname : null;
      });

    this.phrases = [
      'HOME.WELCOME.PHRASES.1',
      'HOME.WELCOME.PHRASES.2',
      'HOME.WELCOME.PHRASES.3',
      'HOME.WELCOME.PHRASES.4',
      'HOME.WELCOME.PHRASES.5',
      'HOME.WELCOME.PHRASES.6',
      'HOME.WELCOME.PHRASES.7',
      'HOME.WELCOME.PHRASES.8',
    ];

    this.buttonPhrases = [
      'HOME.WELCOME.BUTTONS.1',
      'HOME.WELCOME.BUTTONS.2',
      'HOME.WELCOME.BUTTONS.3',
      'HOME.WELCOME.BUTTONS.4',
      'HOME.WELCOME.BUTTONS.5',
      'HOME.WELCOME.BUTTONS.6',
    ];

    this.guestPhrases = [
      'HOME.WELCOME.HELLO_GUEST.1',
      'HOME.WELCOME.HELLO_GUEST.2',
      'HOME.WELCOME.HELLO_GUEST.3',
      'HOME.WELCOME.HELLO_GUEST.4',
      'HOME.WELCOME.HELLO_GUEST.5',
    ];

    this.setRandomButtonText();
    this.setRandomGuestText();

    this.translate.onLangChange.subscribe(() => {
      this.setRandomButtonText();
      this.setRandomGuestText();
    });

    this.startTyping();
  }

  startTyping() {
    const phraseKey = this.phrases[this.phraseIndex];
    const phrase = this.translate.instant(phraseKey);

    if (this.isDeleting) {
      this.currentText = phrase.substring(0, this.charIndex--);
    } else {
      this.currentText = phrase.substring(0, this.charIndex++);
    }

    if (!this.isDeleting && this.charIndex === phrase.length) {
      setTimeout(() => (this.isDeleting = true), 3000);
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
    }

    setTimeout(() => this.startTyping(), this.isDeleting ? 50 : 100);
  }

  private setRandomButtonText() {
    const randomIndex = Math.floor(Math.random() * this.buttonPhrases.length);
    this.translate
      .get(this.buttonPhrases[randomIndex])
      .subscribe((res: string) => {
        this.buttonText = res;
      });
  }

  private setRandomGuestText() {
    const randomIdx = Math.floor(Math.random() * this.guestPhrases.length);
    this.translate
      .get(this.guestPhrases[randomIdx])
      .subscribe((res: string) => {
        this.guestText = res;
      });
  }

  navigateToStart() {
    this.navigation.scrollToSection('start');
  }
}
