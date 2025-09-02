import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-mobile-block',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './mobile-block.component.html',
  styleUrls: ['./mobile-block.component.scss'],
})
export class MobileBlockComponent implements OnInit {
  @HostBinding('class.show-block') showBlock = false;
  messageKey: string = '';

  private keys = [
    'MOBILE.SCREEN_BLOCK.MESSAGE_1',
    'MOBILE.SCREEN_BLOCK.MESSAGE_2',
    'MOBILE.SCREEN_BLOCK.MESSAGE_3',
    'MOBILE.SCREEN_BLOCK.MESSAGE_4',
  ];

  ngOnInit(): void {
    const isMobileUA =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const isSmallScreen = window.innerWidth < 1024;

    this.showBlock = isMobileUA || isSmallScreen;

    if (this.showBlock) {
      document.body.style.overflow = 'hidden';
      this.messageKey = this.keys[Math.floor(Math.random() * this.keys.length)];
    }
  }
}
