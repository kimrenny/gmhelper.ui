import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminState } from './admin.state';

export const selectAdminState = createFeatureSelector<AdminState>('admin');

export const selectAdminSettings = createSelector(
  selectAdminState,
  (state) => state.settings
);

export const selectUsers = createSelector(
  selectAdminState,
  (state) => state.users
);
export const selectTokens = createSelector(
  selectAdminState,
  (state) => state.tokens
);
export const selectRegistrations = createSelector(
  selectAdminState,
  (state) => state.registrations
);
export const selectRequestsData = createSelector(
  selectAdminState,
  (state) => state.requestsData
);
export const selectCountryStats = createSelector(
  selectAdminState,
  (state) => state.countryStats
);
export const selectRoleStats = createSelector(
  selectAdminState,
  (state) => state.roleStats
);
export const selectBlockStats = createSelector(
  selectAdminState,
  (state) => state.blockStats
);
export const selectRequestLogs = createSelector(
  selectAdminState,
  (state) => state.requestLogs
);
export const selectAuthLogs = createSelector(
  selectAdminState,
  (state) => state.authLogs
);
export const selectErrorLogs = createSelector(
  selectAdminState,
  (state) => state.errorLogs
);

export const selectActiveTokens = createSelector(
  selectAdminState,
  (state) => state.tokenStats.activeTokens
);
export const selectTotalTokens = createSelector(
  selectAdminState,
  (state) => state.tokenStats.totalTokens
);
export const selectActiveAdminTokens = createSelector(
  selectAdminState,
  (state) => state.tokenStats.activeAdminTokens
);
export const selectTotalAdminTokens = createSelector(
  selectAdminState,
  (state) => state.tokenStats.totalAdminTokens
);

export const selectIsLoaded = createSelector(
  selectAdminState,
  (state) => state.isLoaded
);
export const selectError = createSelector(
  selectAdminState,
  (state) => state.error
);
