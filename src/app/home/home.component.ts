import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeComponent } from './welcome/welcome.component';
import { AboutComponent } from './about/about.component';
import { FeaturesComponent } from './features/features.component';
import { RoadmapComponent } from './roadmap/roadmap.component';
import { StartComponent } from './start/start.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    WelcomeComponent,
    AboutComponent,
    FeaturesComponent,
    RoadmapComponent,
    StartComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}
