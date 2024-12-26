import { Component } from '@angular/core';
import { WelcomeStarsComponent } from './stars/welcome-stars.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  imports: [CommonModule, WelcomeStarsComponent, TranslateModule],
})
export class WelcomeComponent {}
