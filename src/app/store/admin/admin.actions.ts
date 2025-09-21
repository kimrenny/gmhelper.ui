import { createAction, props } from '@ngrx/store';
import {
  AdminSettings,
  AuthLog,
  BlockStats,
  CombinedRequestsData,
  CountryStats,
  ErrorLog,
  RegistrationData,
  RequestLog,
  RoleStats,
  Token,
  TokenStats,
  User,
} from 'src/app/models/admin.model';

export const loadAdminData = createAction('[Admin] Load Data');

export const loadAdminSettings = createAction('[Admin] Load Admin Settings');
export const loadAdminSettingsSuccess = createAction(
  '[Admin] Load Admin Settings Success',
  props<{ settings: AdminSettings }>()
);
export const loadAdminSettingsFailure = createAction(
  '[Admin] Load Admin Settings Failure',
  props<{ error: any }>()
);
export const updateAdminSetting = createAction(
  '[Admin] Update Admin Setting',
  props<{ sectionTitle: string; switchLabel: string; newValue: boolean }>()
);
export const updateAdminSettingSuccess = createAction(
  '[Admin] Update Admin Setting Success',
  props<{ sectionTitle: string; switchLabel: string; newValue: boolean }>()
);
export const updateAdminSettingFailure = createAction(
  '[Admin] Update Admin Setting Failure',
  props<{ error: any }>()
);
export const setLoadingSettings = createAction(
  '[Admin] Set Loading Settings',
  props<{ loading: boolean }>()
);

export const loadUsers = createAction('[Admin] Load Users');
export const loadUsersSuccess = createAction(
  '[Admin] Load Users Success',
  props<{ users: User[] }>()
);
export const loadUsersFailure = createAction(
  '[Admin] Load Users Failure',
  props<{ error: any }>()
);
export const setLoadingUsers = createAction(
  '[Admin] Set Loading Users',
  props<{ loading: boolean }>()
);

export const loadTokens = createAction('[Admin] Load Tokens');
export const loadTokensSuccess = createAction(
  '[Admin] Load Tokens Success',
  props<{ tokens: Token[] }>()
);
export const loadTokensFailure = createAction(
  '[Admin] Load Tokens Failure',
  props<{ error: any }>()
);
export const setLoadingTokens = createAction(
  '[Admin] Set Loading Tokens',
  props<{ loading: boolean }>()
);

export const loadRegistrations = createAction('[Admin] Load Registrations');
export const loadRegistrationsSuccess = createAction(
  '[Admin] Load Registrations Success',
  props<{ registrations: RegistrationData[] }>()
);
export const loadRegistrationsFailure = createAction(
  '[Admin] Load Registrations Failure',
  props<{ error: any }>()
);
export const setLoadingRegistrations = createAction(
  '[Admin] Set Loading Registrations',
  props<{ loading: boolean }>()
);

export const loadRequestsData = createAction('[Admin] Load Requests Data');
export const loadRequestsDataSuccess = createAction(
  '[Admin] Load Requests Data Success',
  props<{ requestsData: CombinedRequestsData }>()
);
export const loadRequestsDataFailure = createAction(
  '[Admin] Load Requests Data Failure',
  props<{ error: any }>()
);
export const setLoadingRequestsData = createAction(
  '[Admin] Set Loading Requests Data',
  props<{ loading: boolean }>()
);

export const loadCountryStats = createAction('[Admin] Load Country Stats');
export const loadCountryStatsSuccess = createAction(
  '[Admin] Load Country Stats Success',
  props<{ stats: CountryStats[] }>()
);
export const loadCountryStatsFailure = createAction(
  '[Admin] Load Country Stats Failure',
  props<{ error: any }>()
);
export const setLoadingCountryStats = createAction(
  '[Admin] Set Loading Country Stats',
  props<{ loading: boolean }>()
);

export const loadRoleStats = createAction('[Admin] Load Role Stats');
export const loadRoleStatsSuccess = createAction(
  '[Admin] Load Role Stats Success',
  props<{ stats: RoleStats[] }>()
);
export const loadRoleStatsFailure = createAction(
  '[Admin] Load Role Stats Failure',
  props<{ error: any }>()
);
export const setLoadingRoleStats = createAction(
  '[Admin] Set Loading Role Stats',
  props<{ loading: boolean }>()
);

export const loadBlockStats = createAction('[Admin] Load Block Stats');
export const loadBlockStatsSuccess = createAction(
  '[Admin] Load Block Stats Success',
  props<{ stats: BlockStats[] }>()
);
export const loadBlockStatsFailure = createAction(
  '[Admin] Load Block Stats Failure',
  props<{ error: any }>()
);
export const setLoadingBlockStats = createAction(
  '[Admin] Set Loading Block Stats',
  props<{ loading: boolean }>()
);

export const loadRequestLogs = createAction('[Admin] Load Request Logs');
export const loadRequestLogsSuccess = createAction(
  '[Admin] Load Request Logs Success',
  props<{ stats: RequestLog[] }>()
);
export const loadRequestLogsFailure = createAction(
  '[Admin] Load Request Logs Failure',
  props<{ error: any }>()
);
export const setLoadingRequestLogs = createAction(
  '[Admin] Set Loading Request Logs',
  props<{ loading: boolean }>()
);

export const loadAuthLogs = createAction('[Admin] Load Auth Logs');
export const loadAuthLogsSuccess = createAction(
  '[Admin] Load Auth Logs Success',
  props<{ stats: AuthLog[] }>()
);
export const loadAuthLogsFailure = createAction(
  '[Admin] Load Auth Logs Failure',
  props<{ error: any }>()
);
export const setLoadingAuthLogs = createAction(
  '[Admin] Set Loading Auth Logs',
  props<{ loading: boolean }>()
);

export const loadErrorLogs = createAction('[Admin] Load Error Logs');
export const loadErrorLogsSuccess = createAction(
  '[Admin] Load Error Logs Success',
  props<{ stats: ErrorLog[] }>()
);
export const loadErrorLogsFailure = createAction(
  '[Admin] Load Error Logs Failure',
  props<{ error: any }>()
);
export const setLoadingErrorLogs = createAction(
  '[Admin] Set Loading Error Logs',
  props<{ loading: boolean }>()
);

export const loadTokenStats = createAction('[Admin] Load Token Stats');
export const loadTokenStatsSuccess = createAction(
  '[Admin] Load Token Stats Success',
  props<{
    stats: TokenStats;
  }>()
);
export const loadTokenStatsFailure = createAction(
  '[Admin] Load Token Stats Failure',
  props<{ error: any }>()
);
export const setLoadingTokenStats = createAction(
  '[Admin] Set Loading Token Stats',
  props<{ loading: boolean }>()
);

export const setLoaded = createAction(
  '[Admin] Set Data Loaded',
  props<{ isLoaded: boolean }>()
);
