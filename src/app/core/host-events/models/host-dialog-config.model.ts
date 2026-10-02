import { DialogPosition } from '@angular/material/dialog';
import { Direction } from '@angular/cdk/bidi';

/**
 * Compatible dialog configuration for opening dialogs in the host.
 * Compatible with Angular Material 14 and modern versions (15+).
 *
 * Excludes problematic properties for compatibility:
 * - animationDuration: Passed as number (not string)
 * - autoFocus: Uses string instead of boolean
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface HostDialogConfig<T = any> {
  data?: T | null;
  width?: string;
  height?: string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  hasBackdrop?: boolean;
  disableClose?: boolean;
  panelClass?: string | string[];
  backdropClass?: string | string[];
  direction?: Direction;
  position?: DialogPosition;
  closeOnNavigation?: boolean;
  id?: string;
  role?: 'dialog' | 'alertdialog';
  ariaLabel?: string | null;
  ariaLabelledBy?: string | null;
  ariaDescribedBy?: string | null;
  ariaModal?: boolean;
  delayFocusTrap?: boolean;
  restoreFocus?: boolean;
}
