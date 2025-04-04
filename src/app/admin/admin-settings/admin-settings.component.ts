import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSettingsService } from 'src/app/services/admin-settings.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ReplaceColonPipe } from 'src/app/pipes/replace-colon.pipe';
import { ReplaceSpacesPipe } from 'src/app/pipes/replace-spaces.pipe';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReplaceColonPipe, ReplaceSpacesPipe],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss'],
})
export class AdminSettingsComponent implements OnInit {
  sections = [
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

  constructor(
    private settingsService: AdminSettingsService,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.settingsService.getSettings(true).subscribe((settings) => {
      if (settings && Array.isArray(settings) && settings.length > 0) {
        this.initSwitches(settings);
      } else {
        console.error('Invalid settings data received:', settings);
      }
    });
  }

  initSwitches(settings: boolean[][]) {
    if (settings.length !== this.sections.length) {
      console.error('Number of sections does not match settings.');
      return;
    }

    settings.forEach((switchValues, sectionIndex) => {
      if (this.sections[sectionIndex]) {
        switchValues.forEach((value, switchIndex) => {
          if (this.sections[sectionIndex].switches[switchIndex]) {
            this.sections[sectionIndex].switches[switchIndex].value = value;
          }
        });
      }
    });
  }

  handleSwitchChange(switchItem: any, sectionTitle: string) {
    switchItem.value = !switchItem.value;

    this.settingsService
      .updateSwitch(sectionTitle, switchItem.label, switchItem.value)
      .subscribe({
        next: () => {
          this.showAlert('ADMIN.SETTINGS.SUCCESS');
          this.settingsService.updateSettings(
            sectionTitle,
            switchItem.label,
            switchItem.value
          );
        },
        error: () => {
          switchItem.value = !switchItem.value; // rollback changes in case of error
          this.showAlert('ADMIN.SETTINGS.ERROR', true);
        },
      });
  }

  private showAlert(key: string, isError = false) {
    const message = this.translate.instant(key);
    if (isError) {
      this.toastr.error(message);
    } else {
      this.toastr.success(message);
    }
  }
}
