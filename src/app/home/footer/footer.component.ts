import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [TranslateModule, RouterModule, CommonModule],
})
export class FooterComponent {
  collapsed: boolean = false;

  constructor(private navigationService: NavigationService) {}

  goToSection(id: string) {
    this.navigationService.scrollToSection(id);
    this.collapsed = false;
  }

  toggleFooter() {
    this.collapsed = !this.collapsed;
  }
}
