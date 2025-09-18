import { createReducer, on } from '@ngrx/store';
import * as UserActions from './user.actions';
import { initialUserState } from './user.state';

export const userReducer = createReducer(
  initialUserState,
  on(UserActions.setUser, (state, { user }) => ({ ...state, user })),
  on(UserActions.clearUser, (state) => ({
    ...state,
    user: initialUserState.user,
    isAuthorized: false,
    isServerAvailable: true,
    isUserLoading: false,
  })),
  on(UserActions.setAuthorized, (state, { isAuthorized }) => ({
    ...state,
    isAuthorized,
  })),
  on(UserActions.setServerAvailable, (state, { isAvailable }) => ({
    ...state,
    isServerAvailable: isAvailable,
  })),
  on(UserActions.setUserLoading, (state, { isLoading }) => ({
    ...state,
    isUserLoading: isLoading,
  }))
);
