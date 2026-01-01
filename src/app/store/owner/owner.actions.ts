import { createAction, props } from '@ngrx/store';
import {
  OwnerData,
  User,
} from 'src/app/models/admin.model';

export const loadOwnerData = createAction('[Owner] Load Data');

export const loadOwnerDataSuccess = createAction(
  '[Owner] Load Owner Data Success',
  props<{ data: OwnerData }>()
);
export const loadOwnerDataFailure = createAction(
  '[Owner] Load Owner Data Failure',
  props<{ error: any }>()
);

export const loadUsers = createAction(
  '[Owner] Load Users',
  props<{
    page?: number;
    pageSize?: number;
    sortColumn?: keyof User;
    sortDirection?: 'asc' | 'desc';
    maxRegistrationDate?: string;
  }>()
);
export const loadUsersSuccess = createAction(
  '[Owner] Load Users Success',
  props<{ users: User[]; totalCount: number }>()
);
export const loadUsersFailure = createAction(
  '[Owner] Load Users Failure',
  props<{ error: any }>()
);
export const setLoadingUsers = createAction(
  '[Owner] Set Loading Users',
  props<{ loading: boolean }>()
);

export const setLoaded = createAction(
  '[Owner] Set Data Loaded',
  props<{ isLoaded: boolean }>()
);
