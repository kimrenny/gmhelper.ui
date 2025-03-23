import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSettingsService } from 'src/app/services/admin-settings.service';

interface AdminSettings {
  settings: boolean[][];
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss'],
})
export class AdminSettingsComponent implements OnInit {
  sections = [
    {
      title: 'Dashboard',
      switches: [
        { label: 'Setting1', value: true },
        { label: 'Setting2', value: true },
        { label: 'Setting3', value: true },
        { label: 'Setting4', value: true },
        { label: 'Setting5', value: true },
      ],
    },
    {
      title: 'Users',
      switches: [
        { label: 'Setting1', value: true },
        { label: 'Setting2', value: true },
        { label: 'Setting3', value: true },
        { label: 'Setting4', value: true },
        { label: 'Setting5', value: true },
      ],
    },
    {
      title: 'Tokens',
      switches: [
        { label: 'Setting1', value: true },
        { label: 'Setting2', value: true },
        { label: 'Setting3', value: true },
        { label: 'Setting4', value: true },
        { label: 'Setting5', value: true },
      ],
    },
    {
      title: 'Logs',
      switches: [
        { label: 'Setting1', value: true },
        { label: 'Setting2', value: true },
        { label: 'Setting3', value: true },
        { label: 'Setting4', value: true },
        { label: 'Setting5', value: true },
      ],
    },
  ];

  constructor(private settingsService: AdminSettingsService) {}

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

    const sectionIndex = this.sections.findIndex(
      (section) => section.title === sectionTitle
    );
    const sectionId = sectionIndex + 1;
    this.settingsService
      .updateSwitch(sectionId, switchItem.label, switchItem.value)
      .subscribe(() => {
        console.log('Switch updated');
      });
  }
}
