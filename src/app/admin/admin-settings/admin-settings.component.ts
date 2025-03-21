import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSettingsService } from 'src/app/services/admin-settings.service';

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
        { label: 'Switch 1', value: true },
        { label: 'Switch 2', value: true },
        { label: 'Switch 3', value: true },
        { label: 'Switch 4', value: true },
        { label: 'Switch 5', value: true },
      ],
    },
    {
      title: 'Users',
      switches: [
        { label: 'Switch 1', value: true },
        { label: 'Switch 2', value: true },
        { label: 'Switch 3', value: true },
        { label: 'Switch 4', value: true },
        { label: 'Switch 5', value: true },
      ],
    },
    {
      title: 'Tokens',
      switches: [
        { label: 'Switch 1', value: true },
        { label: 'Switch 2', value: true },
        { label: 'Switch 3', value: true },
        { label: 'Switch 4', value: true },
        { label: 'Switch 5', value: true },
      ],
    },
    {
      title: 'Logs',
      switches: [
        { label: 'Switch 1', value: true },
        { label: 'Switch 2', value: true },
        { label: 'Switch 3', value: true },
        { label: 'Switch 4', value: true },
        { label: 'Switch 5', value: true },
      ],
    },
  ];

  constructor(private settingsService: AdminSettingsService) {}

  ngOnInit() {
    this.settingsService.getSettings().subscribe((settings) => {
      settings.forEach((switchValues, sectionIndex) => {
        switchValues.forEach((value, switchIndex) => {
          this.sections[sectionIndex].switches[switchIndex] = {
            label: '',
            value: value,
          };
        });
      });
    });
  }

  handleSwitchChange(switchItem: any, sectionTitle: string) {
    switchItem.value = !switchItem.value;
    console.log(
      `Component: ${sectionTitle}, Switch: ${switchItem.label}, State: ${switchItem.value}`
    );
    this.saveSettings();
  }

  saveSettings() {
    this.settingsService.saveSettings().subscribe(() => {
      console.log('Settings saved');
    });
  }
}
