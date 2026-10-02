export interface MetadataDefinition {
  isRequired: boolean;
  isSearchCriteria: boolean;
  isResultCriteria: boolean;
  isIdentifier: boolean;
  metadataId: number;
  metadataLabel: string;
  metadataSystemName: string;
  metadataType: string;
  metadataMask: string;
  metadataMaskPlaceHolder: string;
  metadataMaskOption: any;
  position: number;
  enabled: boolean;
  optionValues: any[];
  asName: boolean;
  isExternalUpdated: boolean;
  isUnique: boolean;
  isMultivalue: boolean;
  isUpdateable: boolean;
}

export interface Metadata {
  value: string;
  systemName: string;
  name: string;
  description: string;
}

export interface MetadataFind {
  MetadataSearchTypeFrom: string;
  MetadataSearchTypeTo: string;
  MetadataSystemName: string;
  MetadataValueFrom: any;
  MetadataValueTo: any;
  Nullvalue: boolean;
  metadataIsMultivalue: boolean;
}

export interface AddMetadataItem {
  metadataId?: number;
  key: string;
  description: string;
  currentOuId: number;
}

export enum MetadataClass {
  FIXED = 0,
  ADDITIONAL = 1
}