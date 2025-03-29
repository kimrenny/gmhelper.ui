import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LanguageService } from './app/services/language.service';
import { UserService } from './app/services/user.service';

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    const languageService = appRef.injector.get(LanguageService);
    const userService = appRef.injector.get(UserService);

    languageService.initializeLanguage();

    userService.getUserDetailsAsObservable().subscribe((userDetails) => {
      languageService.updateLanguageFromUser(userDetails.language);
    });
  })
  .catch((err) => console.error(err));
