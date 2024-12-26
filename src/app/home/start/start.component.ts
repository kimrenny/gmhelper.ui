import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [CommonModule, TranslateModule, CanvasComponent],
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
})
export class StartComponent {}
