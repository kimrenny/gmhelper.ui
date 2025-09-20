import { createReducer, on } from '@ngrx/store';
import * as AdminActions from './admin.actions';
import { initialAdminState } from './admin.state';
import {
  getSectionIndexByTitle,
  getSwitchIndexByLabel,
} from 'src/app/admin/tools/settings.tool';

export const adminReducer = createReducer(
  initialAdminState,

  on(AdminActions.loadAdminData, (state) => ({ ...state, isLoading: true })),

  on(AdminActions.loadAdminSettingsSuccess, (state, { settings }) => ({
    ...state,
    settings: settings,
  })),
  on(AdminActions.loadAdminSettingsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AdminActions.setLoadingSettings, (state, { loading }) => ({
    ...state,
    loadingSettings: loading,
  })),

  on(
    AdminActions.updateAdminSettingSuccess,
    (state, { sectionTitle, switchLabel, newValue }) => {
      const sectionIndex = getSectionIndexByTitle(sectionTitle);
      const switchIndex = getSwitchIndexByLabel(sectionTitle, switchLabel);

      if (sectionIndex === -1 || switchIndex === -1) return state;

      const currentSettings: boolean[][] = state.settings.settings;

      //bug TypeError: Cannot read properties of undefined (reading 'map') at admin.reducer.ts:33:56
      const newSettings: boolean[][] = currentSettings.map(
        (section: boolean[], sIdx: number) =>
          section.map((sw: boolean, swIdx: number) =>
            sIdx === sectionIndex && swIdx === switchIndex ? newValue : sw
          )
      );

      return {
        ...state,
        settings: { settings: newSettings },
      };
    }
  ),

  on(AdminActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users: users,
  })),
  on(AdminActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AdminActions.setLoadingUsers, (state, { loading }) => ({
    ...state,
    loadingUsers: loading,
  })),

  on(AdminActions.loadTokensSuccess, (state, { tokens }) => ({
    ...state,
    tokens: tokens,
  })),
  on(AdminActions.loadTokensFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AdminActions.setLoadingTokens, (state, { loading }) => ({
    ...state,
    loadingTokens: loading,
  })),

  on(AdminActions.loadRegistrationsSuccess, (state, { registrations }) => ({
    ...state,
    registrations: registrations,
  })),
  on(AdminActions.loadRegistrationsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AdminActions.setLoadingRegistrations, (state, { loading }) => ({
    ...state,
    loadingRegistrations: loading,
  })),

  on(AdminActions.loadRequestsDataSuccess, (state, { requestsData }) => ({
    ...state,
    requestsData: requestsData,
  })),
  on(AdminActions.loadRequestsDataFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AdminActions.setLoadingRequestsData, (state, { loading }) => ({
    ...state,
    loadingRequestsData: loading,
  })),

  on(AdminActions.loadCountryStatsSuccess, (state, { stats }) => ({
    ...state,
    countryStats: stats,
  })),
  on(AdminActions.loadCountryStatsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AdminActions.setLoadingCountryStats, (state, { loading }) => ({
    ...state,
    loadingCountryStats: loading,
  })),

  on(AdminActions.loadRoleStatsSuccess, (state, { stats }) => ({
    ...state,
    roleStats: stats,
  })),
  on(AdminActions.loadRoleStatsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AdminActions.setLoadingRoleStats, (state, { loading }) => ({
    ...state,
    loadingRoleStats: loading,
  })),

  on(AdminActions.loadBlockStatsSuccess, (state, { stats }) => ({
    ...state,
    blockStats: stats,
  })),
  on(AdminActions.loadBlockStatsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AdminActions.setLoadingBlockStats, (state, { loading }) => ({
    ...state,
    loadingBlockStats: loading,
  })),

  on(AdminActions.loadRequestLogsSuccess, (state, { stats }) => ({
    ...state,
    requestLogs: stats,
  })),
  on(AdminActions.loadRequestLogsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AdminActions.setLoadingRequestLogs, (state, { loading }) => ({
    ...state,
    loadingRequestLogs: loading,
  })),

  on(AdminActions.loadAuthLogsSuccess, (state, { stats }) => ({
    ...state,
    authLogs: stats,
  })),
  on(AdminActions.loadAuthLogsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AdminActions.setLoadingAuthLogs, (state, { loading }) => ({
    ...state,
    loadingAuthLogs: loading,
  })),

  on(AdminActions.loadErrorLogsSuccess, (state, { stats }) => ({
    ...state,
    errorLogs: stats,
  })),
  on(AdminActions.loadErrorLogsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AdminActions.setLoadingErrorLogs, (state, { loading }) => ({
    ...state,
    loadingErrorLogs: loading,
  })),

  on(AdminActions.loadTokenStatsSuccess, (state, { stats }) => ({
    ...state,
    tokenStats: stats,
  })),
  on(AdminActions.loadTokenStatsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AdminActions.setLoadingTokenStats, (state, { loading }) => ({
    ...state,
    loadingTokenStats: loading,
  })),

  on(AdminActions.setLoaded, (state, { isLoaded }) => ({
    ...state,
    isLoaded: isLoaded,
  }))
);
