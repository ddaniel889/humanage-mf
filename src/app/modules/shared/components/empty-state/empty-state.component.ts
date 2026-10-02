import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { environment } from '../../../../../environments/environment';

type EmptyStateIconName = 'people' | 'calendar';

const iconFileByName: Record<EmptyStateIconName, string> = {
  people: 'people.svg',
  calendar: 'calendar.svg',
};

@Component({
  selector: 'hl-empty-state',
  imports: [NgOptimizedImage],
  template: `
    <div
      class="tw-flex tw-flex-col tw-items-center tw-bg-gray-100 dark:tw-bg-[rgb(80,80,80)] tw-rounded-[10px] tw-py-6 tw-px-8 tw-gap-2"
    >
      <div>
        <img [ngSrc]="iconUrl()" width="55" height="55" alt="" aria-hidden="true" />
      </div>
      <div
        class="tw-flex tw-flex-col tw-items-center tw-gap-0.5 tw-text-center tw-text-gray-900 dark:tw-text-white"
      >
        <span class="tw-text-xl tw-leading-6 tw-font-bold">{{ message() }}</span>
        @if(description()) {
          <p class="tw-text-gray-700 dark:tw-text-gray-300">{{ description() }}</p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  private readonly normalizedBaseUrl = environment.baseUrl.endsWith('/')
    ? environment.baseUrl.slice(0, -1)
    : environment.baseUrl;

  iconName = input.required<EmptyStateIconName>();
  message = input.required<string>();
  description = input<string>();

  readonly iconUrl = computed(() => {
    const fileName = iconFileByName[this.iconName()];
    return `${this.normalizedBaseUrl}/icons/empty-state/${fileName}`;
  });
}
