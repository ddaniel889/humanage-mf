import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { LeaveTypeOuDetailDto } from '../../../../shared/models/Employee';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  getLeaveTypeSummaryFields,
  type LeaveTypeDetailField,
} from './leave-type-detail-fields.utils';

@Component({
  selector: 'hl-leave-type-detail-fields',
  imports: [TranslocoPipe],
  template: `
    <div
      class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-3"
    >
      @for (item of items(); track $index) {
        <div class="hl-card hl-card--plain tw-flex tw-flex-col tw-gap-1 tw-p-4">
          <div class="tw-text-sm tw-font-light">
            {{ item.labelKey | transloco }}
          </div>
          <div class="tw-text-primary tw-text-sm tw-font-bold">
            {{ item.value | transloco }}
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveTypeDetailFields {
  readonly detail = input.required<LeaveTypeOuDetailDto>();

  readonly items = computed<LeaveTypeDetailField[]>(() =>
    getLeaveTypeSummaryFields(this.detail()),
  );
}
