import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  imports: [TranslateModule],
})
export class RoadmapComponent {}
