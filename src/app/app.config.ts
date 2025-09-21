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
import { provideStore } from '@ngrx/store';
import { userReducer } from './store/user/user.reducer';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';
import { provideEffects } from '@ngrx/effects';
import { UserEffects } from './store/user/user.effects';
import { AuthEffects } from './store/auth/auth.effects';
import { authReducer } from './store/auth/auth.reducer';
import { adminReducer } from './store/admin/admin.reducer';
import { AdminEffects } from './store/admin/admin.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideStore({ user: userReducer, auth: authReducer, admin: adminReducer }),
    provideEffects([UserEffects, AuthEffects, AdminEffects]),
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
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
    }),
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
