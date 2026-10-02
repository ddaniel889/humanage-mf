import { inject, Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { DialogComponent } from './dialog.component';
import { DialogOptions } from '../models/dialogOptions.model';
import {
  DialogData,
  DialogConfirmationComponent,
} from '../components/dialog-confirmation/dialog-confirmation.component';

type ErrorMessages = Record<string, string>;
const DEFAULT_DURATION_MS = 5000;
const EXTENDED_DURATION_MS = 15000;

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private readonly config = new MatSnackBarConfig();
  private readonly snackBar = inject(MatSnackBar);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly dialog = inject(MatDialog);
  private readonly transloco = inject(TranslocoService);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showError(error: any): void {
    const message = this.getErrorMessage(error);
    const action = this.getLabel('understood');
    this.snackBar.open(message, action, this.config);
  }

  showInfo(msj: string, extendDuration = false, showConfirm = false) {
    const action = showConfirm ? this.getLabel('understood') : '';
    const duration = extendDuration ? EXTENDED_DURATION_MS : DEFAULT_DURATION_MS;
    const config = { ...this.config, duration };
    this.snackBar.open(msj, action, config);
  }

  showConfirmation(data: DialogData, config?: MatDialogConfig): Observable<boolean | undefined> {
    return this.dialog
      .open<DialogConfirmationComponent, DialogData, boolean>(DialogConfirmationComponent, {
        panelClass: ['dialog-paper', 'mf-hl-tailwind-scope'],
        width: '450px',
        ...config,
        data,
        disableClose: data.disableClose ?? false,
      })
      .afterClosed();
  }

  showOkCancel(msj: string, okAction?: string, cancelAction?: string): Observable<boolean | null> {
    const sheetRef = this.bottomSheet.open(DialogComponent, {
      data: {
        message: msj,
        okAction: okAction || this.getLabel('accept'),
        cancelAction: cancelAction || this.getLabel('cancel'),
        option: DialogOptions.OkCancel,
      },
    });

    return sheetRef.afterDismissed();
  }

  showYesNoCancel(
    msj: string,
    yesAction?: string,
    noAction?: string,
    cancelAction?: string,
  ): Observable<boolean | null> {
    const sheetRef = this.bottomSheet.open(DialogComponent, {
      data: {
        message: msj,
        okAction: yesAction || this.getLabel('yes'),
        noAction: noAction || this.getLabel('no'),
        cancelAction: cancelAction || this.getLabel('cancel'),
        option: DialogOptions.YesNoCancel,
      },
    });

    return sheetRef.afterDismissed();
  }

  close() {
    this.snackBar.dismiss();
  }

  private getLabel(key: string): string {
    return this.transloco.translate(`common.message-service.${key}`);
  }

  private getErrorMessage(error: unknown): string {
    const defaultMessage = this.transloco.translate('errors.default');
    const messages = this.transloco.getTranslation('errors');

    if (!messages || !error) {
      return defaultMessage;
    }

    if (typeof error === 'string') {
      return messages[error] ?? defaultMessage;
    }

    if (typeof error !== 'object') {
      return defaultMessage;
    }

    const errorObj = error as Record<string, unknown>;
    return this.findErrorMessage(errorObj, messages, defaultMessage);
  }

  private findErrorMessage(
    error: Record<string, unknown>,
    messages: ErrorMessages,
    defaultMessage: string,
  ): string {
    // Intenta con code primero
    if (error['code'] && typeof error['code'] === 'string') {
      const code = this.normalizeErrorCode(error['code']);
      if (messages[code]) return messages[code];
    }

    // Luego intenta con description
    if (error['description'] && typeof error['description'] === 'string') {
      if (messages[error['description']]) return messages[error['description']];
    }

    // Finalmente intenta con message
    if (error['message'] && typeof error['message'] === 'string') {
      if (messages[error['message']]) return messages[error['message']];
    }

    return defaultMessage;
  }

  private normalizeErrorCode(code: string): string {
    // Casos especiales
    if (code === 'Metadata Nro Legajo is requerid') {
      return 'NroLegajoRequerid';
    }

    // Patrón: "Metadata X is required" -> "MetadataRequerid"
    if (code.startsWith('Metadata ') && code.endsWith('is required')) {
      return 'MetadataRequerid';
    }

    // Remover espacios
    return code.replaceAll(' ', '');
  }
}
