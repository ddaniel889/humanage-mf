import { FileDocumentMetadata } from "./file-document-metadata.model";

export class EmployeeMetadata {
  metadataId: number;
  legSystemName: string;
  metadataSystemName: string;
  optionValues: [];
  metadataType: string;
  isRequired: boolean;
  isReplicated: boolean;
  isSearchCriteria?: boolean;
  isResultCriteria?: boolean;
  metadataLabel: string;
  metadataValue: any;
  metadataMask: string;
  metadataMaskPlaceHolder: string;
  descriptionValue?: string;
  position?: number;

  constructor(systemName: string = null, value: any = null) {
    this.metadataSystemName = systemName;
    this.metadataValue = value;
  }

  get periodPattern(): string {
    return '([12]\\d{3}(0[1-9]|1[0-2]))';
  }
}
