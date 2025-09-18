import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { DeviceService } from 'src/app/services/device.service';

@Component({
  selector: 'app-devices-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './devices-settings.component.html',
  styleUrls: ['./devices-settings.component.scss'],
})
export class DevicesSettingsComponent implements OnInit {
  devices: any[] = [];
  devicesLoaded = false;

  constructor(
    private deviceService: DeviceService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices() {
    this.deviceService.getLoggedDevices().subscribe({
      next: (devices) => {
        this.devices = devices || [];
        this.devicesLoaded = true;
      },
      error: (err) => console.error('Error fetching devices:', err),
    });
  }

  deactivateDevice(device: any) {
    this.deviceService.deactivateDevice(device).subscribe({
      next: () => {
        this.loadDevices();
      },
      error: (err) => {
        switch (err.error.message) {
          case 'The current device cannot be deactivated.': {
            this.toastr.error(
              this.translate.instant('SETTINGS.DEVICES.ERROR.CURRENT_DEVICE'),
              this.translate.instant('SETTINGS.DEVICES.ERROR.TITLE')
            );
            break;
          }
          default: {
            this.toastr.error(
              this.translate.instant('SETTINGS.DEVICES.ERROR.OTHER'),
              this.translate.instant('SETTINGS.DEVICES.ERROR.TITLE')
            );
          }
        }
        console.error('Error deactivating device:', err);
      },
    });
  }
}
