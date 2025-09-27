export interface AuthState {
  accessToken: string | null;
  userRole: string | null;
  isRefreshing: boolean;
  isServerAvailable: boolean;
  error: any | null;
  isAuthChecked: boolean;
}

export const initialAuthState: AuthState = {
  accessToken: null,
  userRole: null,
  isRefreshing: false,
  isServerAvailable: true,
  error: null,
  isAuthChecked: false,
};
