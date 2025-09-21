import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ReplaceColonPipe } from 'src/app/pipes/replace-colon.pipe';
import { ReplaceSpacesPipe } from 'src/app/pipes/replace-spaces.pipe';
import { SwitchItem } from 'src/app/models/admin.model';
import * as AdminState from 'src/app/store/admin/admin.state';
import * as AdminActions from 'src/app/store/admin/admin.actions';
import { select, Store } from '@ngrx/store';
import { selectAdminSettings } from 'src/app/store/admin/admin.selectors';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReplaceColonPipe, ReplaceSpacesPipe],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss'],
})
export class AdminSettingsComponent implements OnInit, OnDestroy {
  sections: { title: string; switches: SwitchItem[] }[] = [
    {
      title: 'Dashboard',
      switches: [
        { label: 'Requests', value: true, apiKey: 'Requests' },
        { label: 'Tokens', value: true, apiKey: 'Tokens' },
        { label: 'Banned', value: true, apiKey: 'Banned' },
        { label: 'Roles', value: true, apiKey: 'Roles' },
        { label: 'Country', value: true, apiKey: 'Country' },
      ],
    },
    {
      title: 'Users',
      switches: [
        { label: 'Username', value: true, apiKey: 'Username' },
        { label: 'Email', value: true, apiKey: 'Email' },
        { label: 'Registration', value: true, apiKey: 'Registration' },
        { label: 'Modal', value: true, apiKey: 'Modal' },
        { label: 'Modal: Token', value: true, apiKey: 'ModalToken' },
      ],
    },
    {
      title: 'Tokens',
      switches: [
        { label: 'Token', value: true, apiKey: 'Token' },
        { label: 'Expirations', value: true, apiKey: 'Expirations' },
        { label: 'User ID', value: true, apiKey: 'UserID' },
        { label: 'Modal', value: true, apiKey: 'Modal' },
        { label: 'Actions', value: true, apiKey: 'Actions' },
      ],
    },
    {
      title: 'Logs',
      switches: [
        { label: 'Timestamp', value: true, apiKey: 'Timestamp' },
        { label: 'Duration', value: true, apiKey: 'Duration' },
        { label: 'Request', value: true, apiKey: 'Request' },
        { label: 'User ID', value: true, apiKey: 'UserID' },
        { label: 'Modal', value: true, apiKey: 'Modal' },
      ],
    },
  ];

  private subscriptions = new Subscription();
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AdminState.AdminState>,
    private actions$: Actions,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const dataSub = this.store
      .pipe(select(selectAdminSettings))
      .subscribe((settings) => {
        if (settings && Array.isArray(settings)) {
          this.initSwitches(settings);
        }
      });

    this.subscriptions.add(dataSub);

    this.actions$
      .pipe(
        ofType(AdminActions.updateAdminSettingSuccess),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.toastr.success(
          this.translate.instant('ADMIN.SUCCESS.MESSAGE'),
          this.translate.instant('ADMIN.SUCCESS.TITLE')
        );
      });

    this.actions$
      .pipe(
        ofType(AdminActions.updateAdminSettingFailure),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.toastr.error(
          this.translate.instant('ADMIN.ERRORS.SETTINGS'),
          this.translate.instant('ADMIN.ERRORS.ERROR')
        );
      });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  initSwitches(settings: boolean[][]) {
    if (!settings || !Array.isArray(settings)) return;

    settings.forEach((switchValues, sectionIndex) => {
      if (this.sections[sectionIndex] && Array.isArray(switchValues)) {
        switchValues.forEach((value, switchIndex) => {
          if (this.sections[sectionIndex].switches[switchIndex] !== undefined) {
            this.sections[sectionIndex].switches[switchIndex].value = value;
          }
        });
      }
    });
  }

  onToggle(sectionTitle: string, switchItem: SwitchItem, newValue: boolean) {
    this.store.dispatch(
      AdminActions.updateAdminSetting({
        sectionTitle,
        switchLabel: switchItem.apiKey,
        newValue,
      })
    );
  }
}
