import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ChapaComponent } from '@shared/chapa/chapa.component';

@Component({
  selector: 'app-welcome',
  template: `
    <app-chapa
      [className]="'info-empty'"
      [icon]="'fa-hand-sparkles'"
      [text]="'common.welcome.welcomeMessageLbl' | transloco"
      [subText]="'common.welcome.welcomeMessageSubtitleLbl' | transloco"
    >
    </app-chapa>
  `,
  imports: [ChapaComponent, TranslocoPipe],
})
export class WelcomeComponent {}
