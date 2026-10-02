import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoDirective } from '@jsverse/transloco';
import { GroupDetails } from '../../../models/group';

@Component({
  selector: 'app-dialog-assign-success',
  template: `
    <ng-container *transloco="let t; prefix: 'groupConfig.dialogAssignSuccess'">
      <div
        class="tw-flex tw-flex-col tw-items-center tw-p-6 tw-rounded-[20px] tw-bg-[#F2F2F2] dark:tw-bg-[#505050] tw-text-center"
      >
        <button class="tw-self-end" (click)="onCloseClick()">
          <i class="fa fa-times tw-size-6 tw-text-2xl" aria-hidden="true"></i>
        </button>
        <div class="tw-flex tw-flex-col tw-items-center tw-gap-4">
          <div
            class="tw-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-rounded-md tw-bg-green-100 dark:tw-bg-green-900"
          >
            <i class="fa fa-check tw-text-3xl tw-text-green-600" aria-hidden="true"></i>
          </div>
          <h1 class="tw-font-bold tw-text-2xl dark:tw-text-white">{{ t('title', { count: data.count }) }}</h1>
          <p class="dark:tw-text-gray-300">
            {{ t('description', { groupName: data.group.name }) }}
          </p>
        </div>
      </div>
    </ng-container>
  `,
  styles: [],
  imports: [MatButtonModule, TranslocoDirective],
})
export class DialogAssignSuccessComponent {
  readonly dialogRef = inject(MatDialogRef<DialogAssignSuccessComponent>);
  readonly data = inject<{ group: GroupDetails; count: number }>(MAT_DIALOG_DATA);

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
