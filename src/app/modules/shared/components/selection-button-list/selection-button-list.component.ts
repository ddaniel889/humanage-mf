import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface SelectionButtonItem {
  value: number | string;
  label: string;
}

@Component({
  selector: 'hl-selection-button-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (title(); as title) {
      <p class="tw-font-semibold tw-text-base tw-mb-3">{{ title }}</p>
    }
    <div class="tw-flex tw-flex-wrap tw-gap-3" role="radiogroup">
      @for (item of items(); track item.value) {
        @let isSelected = value() === item.value;
        <label
          class="tw-rounded-md tw-border tw-px-6 tw-py-3 tw-font-medium tw-cursor-pointer tw-transition-[background-color] tw-select-none"
          [class]="isSelected ? selectedClass : defaultClass"
        >
          <input
            type="radio"
            [attr.name]="name()"
            class="tw-sr-only"
            [value]="item.value"
            [checked]="isSelected"
            (change)="onSelect(item)"
          />
          {{ item.label }}
        </label>
      }
    </div>
  `,
})
export class SelectionButtonListComponent {
  readonly items = input.required<SelectionButtonItem[]>();
  readonly title = input<string>();
  readonly name = input.required<string>();
  readonly value = model<number | string | null>(null);

  protected readonly selectedClass =
    'tw-text-[var(--mf-color-contrast-primary)] tw-border-primary tw-bg-primary';
  protected readonly defaultClass =
    'tw-text-[#5F5F5F] tw-bg-[#F2F2F2] tw-border-[#E6E6E6] dark:tw-text-[#F2F2F2] dark:tw-bg-[#5F5F5F] dark:tw-border-[#5F5F5F]';

  onSelect(item: SelectionButtonItem): void {
    this.value.set(item.value);
  }
}
