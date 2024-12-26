import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-features',
  standalone: true,
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
  imports: [TranslateModule],
})
export class FeaturesComponent {}
