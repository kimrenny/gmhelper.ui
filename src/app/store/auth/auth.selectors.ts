import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAccessToken = createSelector(
  selectAuthState,
  (state) => state.accessToken
);

export const selectUserRole = createSelector(
  selectAuthState,
  (state) => state.userRole
);

export const selectIsRefreshing = createSelector(
  selectAuthState,
  (state) => state.isRefreshing
);

export const selectIsServerAvailable = createSelector(
  selectAuthState,
  (state) => state.isServerAvailable
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectIsAuthChecked = createSelector(
  selectAuthState,
  (state) => state.isAuthChecked
);
