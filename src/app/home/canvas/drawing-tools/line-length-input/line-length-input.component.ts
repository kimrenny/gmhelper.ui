import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LineLength } from '../types/line-length.type';

@Component({
  selector: 'line-length-input',
  standalone: true,
  templateUrl: './line-length-input.component.html',
  styleUrls: ['./line-length-input.component.scss'],
})
export class LineLengthInputComponent {
  @Input() initialValue: LineLength = '?';
  @Output() confirm = new EventEmitter<LineLength>();

  value: LineLength = this.initialValue;

  ngOnChanges() {
    this.value = this.initialValue;
  }

  setValue(value: LineLength) {
    this.value = value;
  }

  decrease() {
    if (
      !this.value ||
      this.value == 'x' ||
      this.value == 'y' ||
      this.value == '?'
    ) {
      this.value = 1;
    } else {
      if (this.value > 2) this.value--;
    }
  }

  increase() {
    if (
      !this.value ||
      this.value == 'x' ||
      this.value == 'y' ||
      this.value == '?'
    ) {
      this.value = 1;
    } else {
      this.value++;
    }
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const val = input.value.trim();

    if (val === 'x' || val === 'y' || val === '?') {
      this.value = val;
      return;
    }

    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      this.value = Math.min(180, Math.max(1, num));
    } else {
      this.value = '?';
    }
  }

  save() {
    this.confirm.emit(this.value);
  }
}
