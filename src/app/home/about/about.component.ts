import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ExampleAnimationComponent } from './exampleAnimation/exampleAnimation.component';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  imports: [TranslateModule, ExampleAnimationComponent],
})
export class AboutComponent {}
