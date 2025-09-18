import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LanguageService } from './app/services/language.service';
import { Store } from '@ngrx/store';
import * as UserActions from './app/store/user/user.actions';
import * as UserSelectors from './app/store/user/user.selectors';
import { first } from 'rxjs';

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    const languageService = appRef.injector.get(LanguageService);
    const store = appRef.injector.get(Store);

    languageService.initializeLanguage();

    store.dispatch(UserActions.initUser());

    store
      .select((state) => state.user.user)
      .subscribe((user) => {
        if (!user) return;
        languageService.updateLanguageFromUser(user.language);
      });
  })
  .catch((err) => console.error(err));
