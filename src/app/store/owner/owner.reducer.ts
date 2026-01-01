import { createReducer, on } from '@ngrx/store';
import * as OwnerActions from './owner.actions';
import { initialOwnerState } from './owner.state';

export const ownerReducer = createReducer(
  initialOwnerState,

  on(OwnerActions.loadOwnerData, (state) => ({
    ...state,
    isLoading: true,
    loadingUsers: true,
  })),
  on(OwnerActions.loadOwnerDataSuccess, (state, { data }) => ({
    ...state,
    users: data.users.items,
    totalUsersCount: data.users.totalCount,

    isLoading: false,
    loadingUsers: false,
    isLoaded: true,
  })),
  on(OwnerActions.loadOwnerDataFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingUsers: false,
    isLoaded: true,
    error: error,
  })),

  on(OwnerActions.loadUsersSuccess, (state, { users, totalCount }) => ({
    ...state,
    users: users,
    totalUsersCount: totalCount,
  })),
  on(OwnerActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(OwnerActions.setLoadingUsers, (state, { loading }) => ({
    ...state,
    loadingUsers: loading,
  })),

  on(OwnerActions.setLoaded, (state, { isLoaded }) => ({
    ...state,
    isLoaded: isLoaded,
  }))
);
