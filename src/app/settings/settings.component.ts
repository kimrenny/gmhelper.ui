import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DevicesSettingsComponent } from './devices-settings/devices-settings.component';
import { LanguageSettingsComponent } from './app-settings/app-settings.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    UserSettingsComponent,
    LanguageSettingsComponent,
    DevicesSettingsComponent,
    TranslateModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  @ViewChild('dropdown') dropdownRef!: ElementRef;

  selectedSection: 'user' | 'settings' | 'devices' = 'user';
  menuOpen = false;

  isAuthorized!: Observable<boolean>;
  isServerAvailable!: Observable<boolean>;

  constructor(
    @Inject(UserService) private userService: UserService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.isAuthorized = this.userService.isAuthorized$;
    this.isServerAvailable = this.userService.isServerAvailable$;
  }

  ngOnInit(): void {
    this.userService.checkAuthentication();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  showSettingsSection(section: 'user' | 'settings' | 'devices') {
    this.selectedSection = section;
  }
}
