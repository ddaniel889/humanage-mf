/* eslint-disable @angular-eslint/prefer-standalone */
import { DOCUMENT } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from '../environments/environment';
import { MessageService } from './modules/shared/errorHandler/message.service';

@Component({
  selector: 'hl-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrl: './../styles.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'mf-hl-tailwind-scope',
  },
})
export class App implements OnInit, OnDestroy {
  private readonly messageService = inject(MessageService);
  private readonly document = inject(DOCUMENT);

  ngOnInit() {
    // Set the version attribute on the custom element
    this.document.querySelector('mf-hl-root')?.setAttribute('mf-leaves-version', environment.version);

    // Check if body has 'dark' class and add 'tw-dark' accordingly
    if (this.document.body.classList.contains('dark')) {
      this.document.body.classList.add('tw-dark');
    }
  }

  ngOnDestroy() {
    this.messageService.close();

    // Remove 'tw-dark' class from body when component is destroyed
    this.document.body.classList.remove('tw-dark');
  }
}
