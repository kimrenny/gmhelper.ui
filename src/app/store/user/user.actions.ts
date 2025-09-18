import { createAction, props } from '@ngrx/store';
import { LanguageCode } from 'src/app/models/languages.model';
import { UserDetails } from 'src/app/models/user.model';

export const initUser = createAction('[User] Init User');
export const setUser = createAction(
  '[User] Set User',
  props<{ user: UserDetails }>()
);
export const loadUser = createAction('[User] Load User');
export const loadUserSuccess = createAction(
  '[User] Load User Success',
  props<{ user: UserDetails }>()
);
export const loadUserFailure = createAction('[User] Load User Failure');
export const clearUser = createAction('[User] Clear User');
export const setAuthorized = createAction(
  '[User] Set Authorized',
  props<{ isAuthorized: boolean }>()
);
export const setServerAvailable = createAction(
  '[User] Set Server Available',
  props<{ isAvailable: boolean }>()
);
export const setUserLoading = createAction(
  '[User] Set User Loading',
  props<{ isLoading: boolean }>()
);
export const updateUserLanguage = createAction(
  '[User] Update Language',
  props<{ language: LanguageCode }>()
);
