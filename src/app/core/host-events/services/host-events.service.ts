import { Injectable } from '@angular/core';
import { HostDialogConfig } from '../models/host-dialog-config.model';
import { EmployeeFileDocumentDialogData } from '../../../modules/shared/models/employee-file-document-dialog-data.model';
import { HostEventTypes, OpenFileDocumentEvent } from '../models';

/**
 * Service for communication between microfrontend and host.
 */
@Injectable({
  providedIn: 'root'
})
export class HostEventsService {
  /**
   * Requests the host to open the document view dialog.
   *
   * Dispatches the 'open-file-document' event with the dialog configuration.
   * The host listens to this event and opens the FileDocumentViewModalComponent.
   *
   * @param config Dialog configuration (data, dimensions, styles, etc.)
   */
  openFileDocument(config: HostDialogConfig<EmployeeFileDocumentDialogData>): void {
    const detail: OpenFileDocumentEvent = { config };
    const event = new CustomEvent(HostEventTypes.OpenFileDocument, { detail });
    globalThis.dispatchEvent(event);
  }
}
