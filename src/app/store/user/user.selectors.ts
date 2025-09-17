import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.state';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectUser = createSelector(
  selectUserState,
  (state) => state.user
);
export const selectIsAuthorized = createSelector(
  selectUserState,
  (state) => state.isAuthorized
);
export const selectIsServerAvailable = createSelector(
  selectUserState,
  (state) => state.isServerAvailable
);
export const selectIsUserLoading = createSelector(
  selectUserState,
  (state) => state.isUserLoading
);
