import { EmployeeFileDocumentDialogData } from '../../../modules/shared/models/employee-file-document-dialog-data.model';
import { HostDialogConfig } from './host-dialog-config.model';

/**
 * Event payload structure for opening a file document dialog from the microfrontend.
 * Used with CustomEvent to communicate with the host application.
 */
export interface OpenFileDocumentEvent {
  config: HostDialogConfig<EmployeeFileDocumentDialogData>;
}
