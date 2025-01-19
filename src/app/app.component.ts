import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { NavbarComponent } from './home/navbar/navbar.component';
import { HeaderComponent } from './home/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Client';
  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('Navigation started to:', event.url);
      }
      if (event instanceof NavigationEnd) {
        console.log('Navigation ended to:', event.url);
      }
    });
  }
}
