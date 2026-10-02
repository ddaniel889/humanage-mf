import { Component, inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { DialogOptions } from '../models/dialogOptions.model';
import { MatButtonModule } from '@angular/material/button';

interface DialogComponentData {
  option: DialogOptions;
  message: string;
  okAction: string;
  noAction?: string;
  cancelAction: string;
}

@Component({
  selector: 'app-dialog',
  template: `
    <div class="dialog-container">
      <h3>{{ data.message }}</h3>
      <div class="dialog-actions">
        <button mat-button (click)="cancel()" cdkFocusInitial>{{ data.cancelAction }}</button>
        @if (data.option === YesNoCancel) {
          <button mat-button (click)="no()">{{ data.noAction }}</button>
        }
        <button mat-button (click)="ok()">{{ data.okAction }}</button>
      </div>
    </div>
  `,
  styles: `
    .dialog-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .dialog-actions {
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
      gap: 16px;
      width: 100%;
    }
  `,
  imports: [MatButtonModule],
})
export class DialogComponent {
  readonly YesNoCancel = DialogOptions.YesNoCancel;

  private readonly bottomSheetRef = inject<MatBottomSheetRef<DialogComponent>>(MatBottomSheetRef);
  readonly data = inject<DialogComponentData>(MAT_BOTTOM_SHEET_DATA);

  cancel(): void {
    if (this.data.option === DialogOptions.YesNoCancel) {
      this.bottomSheetRef.dismiss(null);
    } else {
      this.bottomSheetRef.dismiss(false);
    }
  }

  no(): void {
    this.bottomSheetRef.dismiss(false);
  }

  ok(): void {
    this.bottomSheetRef.dismiss(true);
  }
}
