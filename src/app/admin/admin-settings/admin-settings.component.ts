import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ReplaceColonPipe } from 'src/app/pipes/replace-colon.pipe';
import { ReplaceSpacesPipe } from 'src/app/pipes/replace-spaces.pipe';
import { AdminSettings, SwitchItem } from 'src/app/models/admin.model';
import * as AdminState from 'src/app/store/admin/admin.state';
import * as AdminActions from 'src/app/store/admin/admin.actions';
import { select, Store } from '@ngrx/store';
import { selectAdminSettings } from 'src/app/store/admin/admin.selectors';
import { Subscription } from 'rxjs';

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
        { label: 'Requests', value: true },
        { label: 'Tokens', value: true },
        { label: 'Banned', value: true },
        { label: 'Roles', value: true },
        { label: 'Country', value: true },
      ],
    },
    {
      title: 'Users',
      switches: [
        { label: 'Username', value: true },
        { label: 'Email', value: true },
        { label: 'Registration', value: true },
        { label: 'Modal', value: true },
        { label: 'Modal: Token', value: true },
      ],
    },
    {
      title: 'Tokens',
      switches: [
        { label: 'Token', value: true },
        { label: 'Expirations', value: true },
        { label: 'User ID', value: true },
        { label: 'Modal', value: true },
        { label: 'Actions', value: true },
      ],
    },
    {
      title: 'Logs',
      switches: [
        { label: 'Timestamp', value: true },
        { label: 'Duration', value: true },
        { label: 'Request', value: true },
        { label: 'User ID', value: true },
        { label: 'Modal', value: true },
      ],
    },
  ];

  private subscriptions = new Subscription();

  constructor(
    private store: Store<AdminState.AdminState>,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const dataSub = this.store
      .pipe(select(selectAdminSettings))
      .subscribe((settings) => {
        if (settings.settings && Array.isArray(settings.settings)) {
          this.initSwitches(settings.settings);
        }
      });

    this.subscriptions.add(dataSub);
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

  onToggle(sectionTitle: string, switchLabel: string, newValue: boolean) {
    this.store.dispatch(
      AdminActions.updateAdminSetting({ sectionTitle, switchLabel, newValue })
    );
  }
}
