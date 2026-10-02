import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'hl-version',
  standalone: true,
  template: `<span class="tw-font-light tw-text-xs tw-text-secondary">{{ version }}</span>`,
})
export class VersionComponent {
  version = environment.version;
}
