import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HeaderService {
  private _showAuthHighlight = new BehaviorSubject<boolean>(false);
  showAuthHighlight$ = this._showAuthHighlight.asObservable();

  triggerHighlight(duration: number = 5000) {
    this._showAuthHighlight.next(true);
    setTimeout(() => {
      this._showAuthHighlight.next(false);
    }, duration);
  }
}
