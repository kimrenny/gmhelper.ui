import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WelcomeComponent } from '../home/welcome/welcome.component';
import { AboutComponent } from '../home/about/about.component';
import { FeaturesComponent } from '../home/features/features.component';
import { ContactComponent } from '../home/contact/contact.component';
import { StartComponent } from './start/start.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    WelcomeComponent,
    AboutComponent,
    FeaturesComponent,
    ContactComponent,
    StartComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const sectionId = params.get('id');
      if (sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }
}
