import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-features',
  standalone: true,
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
  imports: [TranslateModule],
})
export class FeaturesComponent {
  onEnter(event: MouseEvent): void{
    const card = event.currentTarget as HTMLElement;
    const inner = card.querySelector('.card-inner') as HTMLElement;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const half = rect.width / 2;

    if(x < half){
      inner.style.transform = 'rotateY(-180deg)';
    } else{
      inner.style.transform = 'rotateY(180deg)';
    }
  }

  onLeave(event: MouseEvent): void{
    const card = event.currentTarget as HTMLElement;
    const inner = card.querySelector('.card-inner') as HTMLElement;

    inner.style.transform = 'rotate(0deg)';
  }
}
