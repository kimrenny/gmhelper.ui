import { UserDetails } from 'src/app/models/user.model';

export interface UserState {
  user: UserDetails;
  isAuthorized: boolean;
  isServerAvailable: boolean;
  isUserLoading: boolean;
}

export const initialUserState: UserState = {
  user: {
    avatar: null,
    nickname: 'Guest',
    language: 'en',
    twoFactor: false,
    alwaysAsk: true,
  },
  isAuthorized: false,
  isServerAvailable: false,
  isUserLoading: false,
};
