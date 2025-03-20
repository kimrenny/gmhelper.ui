import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss'],
})
export class AdminSettingsComponent {
  sections = [
    {
      title: 'Dashboard',
      switches: [
        { label: 'Switch 1', value: false },
        { label: 'Switch 2', value: false },
        { label: 'Switch 3', value: false },
        { label: 'Switch 4', value: false },
        { label: 'Switch 5', value: false },
      ],
    },
    {
      title: 'Users',
      switches: [
        { label: 'Switch 1', value: false },
        { label: 'Switch 2', value: false },
        { label: 'Switch 3', value: false },
        { label: 'Switch 4', value: false },
        { label: 'Switch 5', value: false },
      ],
    },
    {
      title: 'Tokens',
      switches: [
        { label: 'Switch 1', value: false },
        { label: 'Switch 2', value: false },
        { label: 'Switch 3', value: false },
        { label: 'Switch 4', value: false },
        { label: 'Switch 5', value: false },
      ],
    },
    {
      title: 'Logs',
      switches: [
        { label: 'Switch 1', value: false },
        { label: 'Switch 2', value: false },
        { label: 'Switch 3', value: false },
        { label: 'Switch 4', value: false },
        { label: 'Switch 5', value: false },
      ],
    },
  ];

  handleSwitchChange(switchItem: any, sectionTitle: string) {
    switchItem.value = !switchItem.value;
    console.log(
      `Component: ${sectionTitle}, Switch: ${switchItem.label}, State: ${switchItem.value}`
    );
  }
}
