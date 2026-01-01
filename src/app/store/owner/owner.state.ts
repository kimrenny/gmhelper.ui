import {
  User,
} from 'src/app/models/admin.model';

export interface OwnerState {
  users: User[] | null;
  totalUsersCount: number | null;
  isLoaded: boolean;
  error: string | null;

  loadingUsers: boolean;
}

export const initialOwnerState: OwnerState = {
  users: null,
  totalUsersCount: null,
  isLoaded: false,
  error: null,

  loadingUsers: false,
};
