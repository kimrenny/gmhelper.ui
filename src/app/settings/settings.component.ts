import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { DevicesSettingsComponent } from './devices-settings/devices-settings.component';
import { LanguageSettingsComponent } from './app-settings/app-settings.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { SecuritySettingsComponent } from './security-settings/security-settings.component';
import { Store } from '@ngrx/store';
import * as UserState from '../store/user/user.state';
import * as UserSelectors from '../store/user/user.selectors';
import * as UserActions from '../store/user/user.actions';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    UserSettingsComponent,
    LanguageSettingsComponent,
    SecuritySettingsComponent,
    DevicesSettingsComponent,
    TranslateModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  @ViewChild('dropdown') dropdownRef!: ElementRef;

  selectedSection: 'user' | 'settings' | 'security' | 'devices' = 'user';
  menuOpen = false;

  isAuthorized$ = this.store.select(UserSelectors.selectIsAuthorized);
  isServerAvailable$ = this.store.select(UserSelectors.selectIsServerAvailable);

  constructor(
    private toastr: ToastrService,
    private translate: TranslateService,
    private store: Store<UserState.UserState>
  ) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  showSettingsSection(section: 'user' | 'settings' | 'security' | 'devices') {
    this.selectedSection = section;
  }
}
