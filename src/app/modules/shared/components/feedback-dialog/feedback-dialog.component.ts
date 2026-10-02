import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COLOR_CLASSES, HlColor } from '../../types/color.types';

export interface FeedbackDialogData {
  title: string;
  description: string;
  confirmButtonText: string;
  icon: string;
  color: HlColor;
}

@Component({
  selector: 'hl-feedback-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule],
  template: `
    <div
      class="tw-flex tw-h-full tw-flex-col tw-items-center tw-p-8 tw-gap-24 tw-text-center"
    >
      <button class="tw-self-end" (click)="onCloseClick()">
        <i class="fa fa-times tw-text-primary tw-size-6 tw-text-2xl" aria-hidden="true"></i>
      </button>
      <div class="tw-flex tw-flex-col tw-items-center tw-gap-12">
        <div class="tw-flex tw-flex-col tw-items-center tw-gap-6">
          <div
            class="tw-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-rounded-md"
            [class]="iconContainerClasses()"
          >
            <i class="fa tw-text-3xl" [class]="data.icon" aria-hidden="true"></i>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center">
            <h1 class="tw-font-bold tw-text-[40px] tw-text-primary">{{ data.title }}</h1>
            <p class="dark:tw-text-gray-300">{{ data.description }}</p>
          </div>
        </div>
        <div>
          <button
            matButton="filled"
            color="primary"
            class="tw-font-semibold !tw-text-base"
            (click)="onCloseClick()"
          >
            {{ data.confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class FeedbackDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<FeedbackDialogComponent>);
  readonly data = inject<FeedbackDialogData>(MAT_DIALOG_DATA);

  readonly iconContainerClasses = computed(() => COLOR_CLASSES[this.data.color]);

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
