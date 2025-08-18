import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-code-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './code-input.component.html',
  styleUrls: ['./code-input.component.scss'],
})
export class CodeInputComponent implements OnInit, OnDestroy {
  codeString: string = '';
  codeVisual: string[] = ['', '', '', '', '', ''];

  sourceText: string = '';
  private sub!: Subscription;

  @Output() codeComplete = new EventEmitter<string>();
  @ViewChild('hiddenInput') hiddenInput!: ElementRef<HTMLInputElement>;

  constructor(private registerService: RegisterService) {}

  ngOnInit() {
    this.sub = this.registerService.codeSource$.subscribe((source) => {
      this.sourceText =
        source === 'email'
          ? 'REGISTER.CODE_INPUT.EMAIL'
          : source === 'gauth'
          ? 'REGISTER.CODE_INPUT.GAUTH'
          : '';
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onInputChange() {
    this.codeString = this.codeString.replace(/\D/g, '').slice(0, 6);

    this.codeVisual = this.codeString.split('');
    while (this.codeVisual.length < 6) {
      this.codeVisual.push('');
    }

    if (this.codeString.length === 6) {
      this.codeComplete.emit(this.codeString);
    }
  }

  focusInputField() {
    this.hiddenInput.nativeElement.focus();
  }

  clearCode() {
    this.codeString = '';
    this.codeVisual = ['', '', '', '', '', ''];
  }
}
