import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@jsverse/transloco';

export type ButtonType = 'yes-no' | 'accept-cancel';

export interface DialogData {
  title: string;
  description: string;
  buttonType?: ButtonType;
  confirmLabel?: string;
  cancelLabel?: string;
  disableClose?: boolean;
}

@Component({
  selector: 'hl-dialog-confirmation',
  template: `
    <div
      class="tw-flex tw-flex-col tw-p-6 tw-rounded-[20px] tw-bg-[rgb(242,242,242)] dark:tw-bg-[rgb(80,80,80)]"
    >
      <div class="tw-flex tw-flex-col tw-gap-4">
        <div class="tw-flex tw-justify-between tw-items-start tw-w-full">
          <h1 class="tw-font-bold tw-text-2xl tw-text-default">{{ data.title }}</h1>
          @if (!data.disableClose) {
            <button class="tw-self-end" (click)="dialogRef.close()">
              <i class="fa fa-times tw-size-6 tw-text-2xl tw-ml-8" aria-hidden="true"></i>
            </button>
          }
        </div>
        <p class="tw-text-base tw-text-default tw-whitespace-pre-line">{{ data.description }}</p>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="tw-mt-6 tw-flex tw-gap-3 tw-w-full">
        <button
          matButton="outlined"
          color="primary"
          class="hl-mat-button tw-w-1/2"
          (click)="dialogRef.close(false)"
        >
          {{ cancelLabel() }}
        </button>
        <button
          matButton="filled"
          color="primary"
          class="hl-mat-button tw-w-1/2"
          (click)="dialogRef.close(true)"
        >
          {{ confirmLabel() }}
        </button>
      </div>
    </div>
  `,
  imports: [MatButtonModule],
})
export class DialogConfirmationComponent {
  private readonly translocoService = inject(TranslocoService);
  readonly dialogRef = inject(MatDialogRef<DialogConfirmationComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  readonly translations = toSignal(
    this.translocoService.selectTranslateObject('common.message-service'),
  );

  private readonly confirmKey = this.data.buttonType === 'yes-no' ? 'yes' : 'accept';
  private readonly cancelKey = this.data.buttonType === 'yes-no' ? 'no' : 'cancel';

  readonly confirmLabel = computed(
    () => this.data.confirmLabel || this.translations()?.[this.confirmKey] || '',
  );
  readonly cancelLabel = computed(
    () => this.data.cancelLabel || this.translations()?.[this.cancelKey] || '',
  );
}
