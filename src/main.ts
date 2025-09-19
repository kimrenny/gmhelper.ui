import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LanguageService } from './app/services/language.service';
import { Store } from '@ngrx/store';
import * as AuthActions from './app/store/auth/auth.actions';

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    const languageService = appRef.injector.get(LanguageService);
    const store = appRef.injector.get(Store);

    languageService.initializeLanguage();

    store.dispatch(AuthActions.restoreAuthFromStorage());

    store
      .select((state) => state.user.user)
      .subscribe((user) => {
        if (!user) return;
        languageService.updateLanguageFromUser(user.language);
      });
  })
  .catch((err) => console.error(err));
