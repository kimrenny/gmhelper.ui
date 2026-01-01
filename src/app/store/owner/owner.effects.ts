import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import * as OwnerActions from './owner.actions';
import { AdminService } from 'src/app/services/admin.service';
import { OwnerState } from './owner.state';
import { of } from 'rxjs';
import {
  filter,
  switchMap,
  map,
  catchError,
  withLatestFrom,
  mergeMap,
} from 'rxjs/operators';
import {
  User,
} from 'src/app/models/admin.model';

@Injectable()
export class OwnerEffects {
  constructor(
    private actions$: Actions,
    private adminService: AdminService,
    private store: Store<OwnerState>
  ) {}

  loadOwnerData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OwnerActions.loadOwnerData),
      switchMap(() =>
        this.adminService.getOwnerData().pipe(
          map((data) => OwnerActions.loadOwnerDataSuccess({ data })),
          catchError((error) =>
            of(OwnerActions.loadOwnerDataFailure({ error }))
          )
        )
      )
    )
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OwnerActions.loadUsers),
      withLatestFrom(
        this.store.pipe(select((state: OwnerState) => state.loadingUsers))
      ),
      filter(([_, loading]) => !loading),
      switchMap(([action, _]) => {
        this.store.dispatch(OwnerActions.setLoadingUsers({ loading: true }));

        return this.adminService
          .getUsers(
            action.page ?? 1,
            action.pageSize ?? 10,
            action.sortColumn ?? 'registrationDate',
            action.sortDirection === 'desc',
            action.maxRegistrationDate
          )
          .pipe(
            map(({ users, totalCount }) => {
              this.store.dispatch(
                OwnerActions.setLoadingUsers({ loading: false })
              );
              return OwnerActions.loadUsersSuccess({ users, totalCount });
            }),
            catchError((error) => {
              this.store.dispatch(
                OwnerActions.setLoadingUsers({ loading: false })
              );
              return of(OwnerActions.loadUsersFailure({ error }));
            })
          );
      })
    )
  );
}
