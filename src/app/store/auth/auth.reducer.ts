import { createReducer, on } from '@ngrx/store';
import { initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,
  on(
    AuthActions.loginSuccess,
    (state, { accessToken, refreshToken, role }) => ({
      ...state,
      accessToken,
      refreshToken,
      userRole: role,
      isServerAvailable: true,
      error: null,
      isAuthChecked: true,
    })
  ),
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    isRefreshing: true,
  })),
  on(
    AuthActions.refreshTokenSuccess,
    (state, { accessToken, refreshToken }) => ({
      ...state,
      accessToken,
      refreshToken,
      isRefreshing: false,
      isServerAvailable: true,
      error: null,
      isAuthChecked: true,
    })
  ),
  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    isRefreshing: false,
    accessToken: null,
    refreshToken: null,
    userRole: null,
    error,
    isAuthChecked: true,
  })),
  on(AuthActions.logout, () => ({
    ...initialAuthState,
    isServerAvailable: true,
    isAuthChecked: true,
  })),
  on(AuthActions.setServerAvailable, (state, { available }) => ({
    ...state,
    isServerAvailable: available,
  })),
  on(AuthActions.setUserRole, (state, { role }) => ({
    ...state,
    userRole: role,
  })),
  on(AuthActions.setAuthChecked, (state, { checked }) => ({
    ...state,
    isAuthChecked: checked,
  }))
);
