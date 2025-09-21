import {
  AdminSettings,
  AuthLog,
  BlockStats,
  CombinedRequestsData,
  CountryStats,
  ErrorLog,
  initialAdminSettings,
  RegistrationData,
  RequestLog,
  RoleStats,
  Token,
  TokenStats,
  User,
} from 'src/app/models/admin.model';

export interface AdminState {
  settings: AdminSettings;
  users: User[] | null;
  tokens: Token[] | null;
  registrations: RegistrationData[] | null;
  requestsData: CombinedRequestsData | null;
  countryStats: CountryStats[] | null;
  roleStats: RoleStats[] | null;
  blockStats: BlockStats[] | null;
  requestLogs: RequestLog[] | null;
  authLogs: AuthLog[] | null;
  errorLogs: ErrorLog[] | null;
  tokenStats: TokenStats;
  isLoaded: boolean;
  error: string | null;

  loadingSettings: boolean;
  loadingUsers: boolean;
  loadingTokens: boolean;
  loadingRegistrations: boolean;
  loadingRequestsData: boolean;
  loadingCountryStats: boolean;
  loadingRoleStats: boolean;
  loadingBlockStats: boolean;
  loadingRequestLogs: boolean;
  loadingAuthLogs: boolean;
  loadingErrorLogs: boolean;
  loadingTokenStats: boolean;
}

export const initialAdminState: AdminState = {
  settings: initialAdminSettings,
  users: null,
  tokens: null,
  registrations: null,
  requestsData: null,
  countryStats: null,
  roleStats: null,
  blockStats: null,
  requestLogs: null,
  authLogs: null,
  errorLogs: null,
  tokenStats: {
    activeTokens: null,
    totalTokens: null,
    activeAdminTokens: null,
    totalAdminTokens: null,
  },
  isLoaded: false,
  error: null,

  loadingSettings: false,
  loadingUsers: false,
  loadingTokens: false,
  loadingRegistrations: false,
  loadingRequestsData: false,
  loadingCountryStats: false,
  loadingRoleStats: false,
  loadingBlockStats: false,
  loadingRequestLogs: false,
  loadingAuthLogs: false,
  loadingErrorLogs: false,
  loadingTokenStats: false,
};
