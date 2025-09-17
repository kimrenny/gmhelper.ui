import { createAction, props } from '@ngrx/store';
import { UserDetails } from 'src/app/models/user.model';

export const setUser = createAction(
  '[User] Set User',
  props<{ user: UserDetails }>()
);
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
