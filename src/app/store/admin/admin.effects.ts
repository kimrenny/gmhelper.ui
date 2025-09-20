import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import * as AdminActions from './admin.actions';
import { AdminService } from 'src/app/services/admin.service';
import { AdminState } from './admin.state';
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
  AdminSettings,
  AuthLog,
  BlockStats,
  CombinedRequestsData,
  CountryStats,
  ErrorLog,
  RegistrationData,
  RequestLog,
  RoleStats,
  Token,
  TokenStats,
  User,
} from 'src/app/models/admin.model';
import { AdminSettingsService } from 'src/app/services/admin-settings.service';

@Injectable()
export class AdminEffects {
  constructor(
    private actions$: Actions,
    private adminService: AdminService,
    private adminSettingsService: AdminSettingsService,
    private store: Store<AdminState>
  ) {}

  loadAdminData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAdminData),
      mergeMap(() => {
        AdminActions.loadAdminSettings(),
          AdminActions.loadUsers(),
          AdminActions.loadTokens(),
          AdminActions.loadRegistrations(),
          AdminActions.loadRequestsData(),
          AdminActions.loadCountryStats(),
          AdminActions.loadRoleStats(),
          AdminActions.loadBlockStats(),
          AdminActions.loadRequestLogs(),
          AdminActions.loadAuthLogs(),
          AdminActions.loadErrorLogs(),
          AdminActions.loadTokenStats();

        return of(AdminActions.setLoaded({ isLoaded: true }));
      })
    )
  );

  loadSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAdminSettings),
      withLatestFrom(
        this.store.pipe(select((state: AdminState) => state.loadingSettings))
      ),
      filter(([_, loading]) => !loading),
      switchMap(() => {
        this.store.dispatch(AdminActions.setLoadingUsers({ loading: true }));
        return this.adminSettingsService.loadSettings().pipe(
          map((settings: AdminSettings) => {
            this.store.dispatch(
              AdminActions.setLoadingUsers({ loading: false })
            );
            return AdminActions.loadAdminSettingsSuccess({ settings });
          }),
          catchError((error: any) => {
            this.store.dispatch(
              AdminActions.setLoadingUsers({ loading: false })
            );
            return of(AdminActions.loadAdminSettingsFailure({ error }));
          })
        );
      })
    )
  );

  updateSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.updateAdminSetting),
      switchMap(({ sectionTitle, switchLabel, newValue }) =>
        this.adminSettingsService
          .updateSwitch(sectionTitle, switchLabel, newValue)
          .pipe(
            mergeMap(() =>
              of(
                AdminActions.updateAdminSettingSuccess({
                  sectionTitle,
                  switchLabel,
                  newValue,
                }),
                AdminActions.loadAdminSettings()
              )
            ),
            catchError((error) =>
              of(AdminActions.updateAdminSettingFailure({ error }))
            )
          )
      )
    )
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadUsers),
      withLatestFrom(
        this.store.pipe(select((state: AdminState) => state.loadingUsers))
      ),
      filter(([_, loading]) => !loading),
      switchMap(() => {
        this.store.dispatch(AdminActions.setLoadingUsers({ loading: true }));
        return this.adminService.getUsers().pipe(
          map((users: User[]) => {
            this.store.dispatch(
              AdminActions.setLoadingUsers({ loading: false })
            );
            return AdminActions.loadUsersSuccess({ users });
          }),
          catchError((error) => {
            this.store.dispatch(
              AdminActions.setLoadingUsers({ loading: false })
            );
            return of(AdminActions.loadUsersFailure({ error }));
          })
        );
      })
    )
  );

  loadTokens$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadTokens),
      withLatestFrom(
        this.store.pipe(select((state: AdminState) => state.loadingTokens))
      ),
      filter(([_, loading]) => !loading),
      switchMap(() => {
        this.store.dispatch(AdminActions.setLoadingTokens({ loading: true }));
        return this.adminService.getTokens().pipe(
          map((tokens: Token[]) => {
            this.store.dispatch(
              AdminActions.setLoadingTokens({ loading: false })
            );
            return AdminActions.loadTokensSuccess({ tokens });
          }),
          catchError((error) => {
            this.store.dispatch(
              AdminActions.setLoadingTokens({ loading: false })
            );
            return of(AdminActions.loadTokensFailure({ error }));
          })
        );
      })
    )
  );

  loadRegistrations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadRegistrations),
      withLatestFrom(
        this.store.pipe(
          select((state: AdminState) => state.loadingRegistrations)
        )
      ),
      filter(([_, loading]) => !loading),
      switchMap(() => {
        this.store.dispatch(
          AdminActions.setLoadingRegistrations({ loading: true })
        );
        return this.adminService.getRegistrationData().pipe(
          map((registrations: RegistrationData[]) => {
            this.store.dispatch(
              AdminActions.setLoadingRegistrations({ loading: false })
            );
            return AdminActions.loadRegistrationsSuccess({ registrations });
          }),
          catchError((error) => {
            this.store.dispatch(
              AdminActions.setLoadingRegistrations({ loading: false })
            );
            return of(AdminActions.loadRegistrationsFailure({ error }));
          })
        );
      })
    )
  );

  loadRequestsData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadRequestsData),
      withLatestFrom(
        this.store.pipe(
          select((state: AdminState) => state.loadingRequestsData)
        )
      ),
      filter(([_, loading]) => !loading),
      switchMap(() => {
        this.store.dispatch(
          AdminActions.setLoadingRequestsData({ loading: true })
        );
        return this.adminService.getRequestsData().pipe(
          map((requestsData: CombinedRequestsData) => {
            this.store.dispatch(
              AdminActions.setLoadingRequestsData({ loading: false })
            );
            return AdminActions.loadRequestsDataSuccess({ requestsData });
          }),
          catchError((error) => {
            this.store.dispatch(
              AdminActions.setLoadingRequestsData({ loading: false })
            );
            return of(AdminActions.loadRequestsDataFailure({ error }));
          })
        );
      })
    )
  );

  loadCountryStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadCountryStats),
      withLatestFrom(
        this.store.pipe(
          select((state: AdminState) => state.loadingCountryStats)
        )
      ),
      filter(([_, loading]) => !loading),
      switchMap(() => {
        this.store.dispatch(
          AdminActions.setLoadingCountryStats({ loading: true })
        );
        return this.adminService.getUsersByCountry().pipe(
          map((stats: CountryStats[]) => {
            this.store.dispatch(
              AdminActions.setLoadingCountryStats({ loading: false })
            );
            return AdminActions.loadCountryStatsSuccess({ stats });
          }),
          catchError((error) => {
            this.store.dispatch(
              AdminActions.setLoadingCountryStats({ loading: false })
            );
            return of(AdminActions.loadCountryStatsFailure({ error }));
          })
        );
      })
    )
  );

  loadRoleStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadRoleStats),
      withLatestFrom(
        this.store.pipe(select((state: AdminState) => state.loadingRoleStats))
      ),
      filter(([_, loading]) => !loading),
      switchMap(() => {
        this.store.dispatch(
          AdminActions.setLoadingRoleStats({ loading: true })
        );
        return this.adminService.getRoleStats().pipe(
          map((stats: RoleStats[]) => {
            this.store.dispatch(
              AdminActions.setLoadingRoleStats({ loading: false })
            );
            return AdminActions.loadRoleStatsSuccess({ stats });
          }),
          catchError((error) => {
            this.store.dispatch(
              AdminActions.setLoadingRoleStats({ loading: false })
            );
            return of(AdminActions.loadRoleStatsFailure({ error }));
          })
        );
      })
    )
  );

  loadBlockStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadBlockStats),
      withLatestFrom(
        this.store.pipe(select((state: AdminState) => state.loadingBlockStats))
      ),
      filter(([_, loading]) => !loading),
      switchMap(() => {
        this.store.dispatch(
          AdminActions.setLoadingBlockStats({ loading: true })
        );
        return this.adminService.getBlockStats().pipe(
          map((stats: BlockStats[]) => {
            this.store.dispatch(
              AdminActions.setLoadingBlockStats({ loading: false })
            );
            return AdminActions.loadBlockStatsSuccess({ stats });
          }),
          catchError((error) => {
            this.store.dispatch(
              AdminActions.setLoadingBlockStats({ loading: false })
            );
            return of(AdminActions.loadBlockStatsFailure({ error }));
          })
        );
      })
    )
  );

  loadRequestLogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadRequestLogs),
      withLatestFrom(
        this.store.pipe(select((state: AdminState) => state.loadingRequestLogs))
      ),
      filter(([_, loading]) => !loading),
      switchMap(() => {
        this.store.dispatch(
          AdminActions.setLoadingRequestLogs({ loading: true })
        );
        return this.adminService.getRequestLogData().pipe(
          map((stats: RequestLog[]) => {
            this.store.dispatch(
              AdminActions.setLoadingRequestLogs({ loading: false })
            );
            return AdminActions.loadRequestLogsSuccess({ stats });
          }),
          catchError((error) => {
            this.store.dispatch(
              AdminActions.setLoadingRequestLogs({ loading: false })
            );
            return of(AdminActions.loadRequestLogsFailure({ error }));
          })
        );
      })
    )
  );

  loadAuthLogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAuthLogs),
      withLatestFrom(
        this.store.pipe(select((state: AdminState) => state.loadingAuthLogs))
      ),
      filter(([_, loading]) => !loading),
      switchMap(() => {
        this.store.dispatch(AdminActions.setLoadingAuthLogs({ loading: true }));
        return this.adminService.getAuthLogData().pipe(
          map((stats: AuthLog[]) => {
            this.store.dispatch(
              AdminActions.setLoadingAuthLogs({ loading: false })
            );
            return AdminActions.loadAuthLogsSuccess({ stats });
          }),
          catchError((error) => {
            this.store.dispatch(
              AdminActions.setLoadingAuthLogs({ loading: false })
            );
            return of(AdminActions.loadAuthLogsFailure({ error }));
          })
        );
      })
    )
  );

  loadErrorLogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadErrorLogs),
      withLatestFrom(
        this.store.pipe(select((state: AdminState) => state.loadingErrorLogs))
      ),
      filter(([_, loading]) => !loading),
      switchMap(() => {
        this.store.dispatch(
          AdminActions.setLoadingErrorLogs({ loading: true })
        );
        return this.adminService.getErrorLogData().pipe(
          map((stats: ErrorLog[]) => {
            this.store.dispatch(
              AdminActions.setLoadingErrorLogs({ loading: false })
            );
            return AdminActions.loadErrorLogsSuccess({ stats });
          }),
          catchError((error) => {
            this.store.dispatch(
              AdminActions.setLoadingErrorLogs({ loading: false })
            );
            return of(AdminActions.loadErrorLogsFailure({ error }));
          })
        );
      })
    )
  );

  loadTokenStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadTokenStats),
      withLatestFrom(
        this.store.pipe(select((state: AdminState) => state.loadingTokenStats))
      ),
      filter(([_, loading]) => !loading),
      switchMap(() => {
        this.store.dispatch(
          AdminActions.setLoadingTokenStats({ loading: true })
        );
        return this.adminService.getTokenStats().pipe(
          map((stats: TokenStats) => {
            this.store.dispatch(
              AdminActions.setLoadingTokenStats({ loading: false })
            );
            return AdminActions.loadTokenStatsSuccess({ stats });
          }),
          catchError((error) => {
            this.store.dispatch(
              AdminActions.setLoadingTokenStats({ loading: false })
            );
            return of(AdminActions.loadTokenStatsFailure({ error }));
          })
        );
      })
    )
  );
}
