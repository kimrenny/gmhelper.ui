import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'angle-input',
  standalone: true,
  templateUrl: './angle-input.component.html',
  styleUrls: ['./angle-input.component.scss'],
})
export class AngleInputComponent {
  @Input() initialValue: number = 90;
  @Output() confirm = new EventEmitter<number>();

  value: number = this.initialValue;

  ngOnChanges() {
    this.value = this.initialValue;
  }

  decrease() {
    if (this.value > 1) this.value--;
  }

  increase() {
    if (this.value < 180) this.value++;
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = parseInt(input.value, 10);
    if (isNaN(val)) val = 1;
    this.value = Math.min(180, Math.max(1, val));
  }

  save() {
    this.confirm.emit(this.value);
  }
}
