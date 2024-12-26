import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
} from '@ngx-translate/core';
import { CustomTranslateLoader } from './app-translate-loader';
import { AppComponent } from './app.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { GlobalErrorHandler } from './global-error-handler';
import { ErrorHandler } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      HttpClientModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => new CustomTranslateLoader(http),
          deps: [HttpClient],
        },
      })
    ),
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    const translate = appRef.injector.get(TranslateService);
    translate.setDefaultLang('en');
    translate.use('en');
  })
  .catch((err) => console.error(err));
