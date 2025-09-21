export interface DeviceInfo {
  userAgent: string;
  platform: string;
}

export interface LoginToken {
  expiration: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  isActive: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  registrationDate: string;
  isBlocked: boolean;
  loginTokens: LoginToken[];
}

export interface Token {
  id: string;
  token: string;
  expiration: string;
  refreshTokenExpiration: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  isActive: boolean;
}

export interface RequestsData {
  date: string;
  count: number;
}

export interface CombinedRequestsData {
  regular: RequestsData[];
  admin: RequestsData[];
}

export interface RegistrationData {
  date: string;
  registrations: number;
}

export interface TokenStats {
  activeTokens: number | null;
  totalTokens: number | null;
  activeAdminTokens: number | null;
  totalAdminTokens: number | null;
}

export interface CountryStats {
  country: string;
  count: number;
}

export interface RoleStats {
  role: string;
  count: number;
}

export interface BlockStats {
  status: string;
  count: number;
}

export interface RequestLog {
  id: number;
  timestamp: string;
  method: string;
  path: string;
  userId: string;
  requestBody: string;
  statusCode: number;
  startTime: string;
  endTime: string;
  elapsedTime: number;
  ipAddress: string;
  userAgent: string;
  status: string;
  requestType: string;
}

export interface AuthLog {
  id: number;
  timestamp: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  status: string;
  message: string;
}

export interface ErrorLog {
  id: number;
  timestamp: string;
  message: string;
  stackTrace: string;
  endpoint: string;
  exceptionDetails: string;
}

export interface AdminSettings {
  settings: boolean[][];
}

export const initialAdminSettings: AdminSettings = {
  settings: [
    [true, true, true, true, true],
    [true, true, true, true, true],
    [true, true, true, true, true],
    [true, true, true, true, true],
  ],
};

export interface SwitchItem {
  label: string;
  value: boolean;
  apiKey: string;
}
