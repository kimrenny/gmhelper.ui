import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OwnerState } from './owner.state';

export const selectOwnerState = createFeatureSelector<OwnerState>('owner');

export const selectUsers = createSelector(
  selectOwnerState,
  (state) => state.users
);
export const selectUsersCount = createSelector(
  selectOwnerState,
  (state) => state.totalUsersCount
);

export const selectIsLoaded = createSelector(
  selectOwnerState,
  (state) => state.isLoaded
);
export const selectError = createSelector(
  selectOwnerState,
  (state) => state.error
);
