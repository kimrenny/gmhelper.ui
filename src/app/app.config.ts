import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { CustomTranslateLoader } from './app-translate-loader';
import { HttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { GlobalErrorHandler } from './global-error-handler';
import { ErrorHandler } from '@angular/core';
import { UserService } from './services/user.service';
import { ToastrModule } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => new CustomTranslateLoader(http),
          deps: [HttpClient],
        },
      }),
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
        preventDuplicates: true,
      })
    ),
    provideAnimations(),
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    UserService,
  ],
};
