import { createAction, props } from '@ngrx/store';

export const restoreAuthFromStorage = createAction(
  '[Auth] Restore from Storage'
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ accessToken: string; role: string | null }>()
);

export const refreshToken = createAction('[Auth] Refresh Token');

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ accessToken: string }>()
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: any }>()
);

export const logout = createAction('[Auth] Logout');

export const setServerAvailable = createAction(
  '[Auth] Set Server Available',
  props<{ available: boolean }>()
);

export const setUserRole = createAction(
  '[Auth] Set User Role',
  props<{ role: string | null }>()
);

export const setAuthChecked = createAction(
  '[Auth] Set Auth Checked',
  props<{ checked: boolean }>()
);
