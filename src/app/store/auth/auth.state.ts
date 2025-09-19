export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userRole: string | null;
  isRefreshing: boolean;
  isServerAvailable: boolean;
  error: any | null;
  isAuthChecked: boolean;
}

export const initialAuthState: AuthState = {
  accessToken: null,
  refreshToken: null,
  userRole: null,
  isRefreshing: false,
  isServerAvailable: true,
  error: null,
  isAuthChecked: false,
};
