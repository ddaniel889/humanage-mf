import { OrganizationalUnit } from "./organizational-unit.model";
import { DocTypeMetadatas } from './DocTypeMetadatas.model';

export interface DocumentationType {
  id: number;
  name: string;
  ou: OrganizationalUnit;
  description: string;
  creationDate: Date;
  inactiveDate: Date;
  origin: number; // (RRHH O EMPL)
  identificationTypeManual: boolean; // (automatico / manual)
  identificationTypeName: string;
  identificationDataCoordinates: string[]; // (arriba, abajo, izquierda, derecha, desde, hasta)
  documentationTypeSequence: any[];
  signatureSignerCoordinates: string[];
  signatureEmployeeCoordinates: string[];
  legend: string[];
  documentTypeId: number;
  metadataId: string;
  metadataKey: string;
  visualizationMetadatas: any[];
  visualizationOption: any;
  isNonConformityAllowed: boolean;
  nonConformityReasonId: number;
  exteralForm: string;
  documentationLoadContentId: number;
  documentationLoadContentName: string;
  isExternalFormOnly: boolean;
  docTypesMetadatas: DocTypeMetadatas[];
  organizationalUnitId: number;
  finished: boolean;
  documentationStarterId: number;
  enabled: boolean;
  hasExternalForm: boolean;
}

export enum maxFiles {
  SIMPLE = 1,
  MULTIPLE = 5000
}

export enum DocumentationOrigin {
  RRHH = 1,
  AMBOS = 2
}

export enum DocumentationLoadContent {
  RRHH =	1,
  EMPLEADO	= 2,
  AMBOS	= 3
}

export enum ACEPTED_EXTENSION {
  MANUAL = '.pdf, .jpg, .jpeg, .tiff, .gif, .png',
  AUTOMATICO = '.pdf, .jpg, .jpeg, .tiff, .gif, .png, .zip',
  LSD = '.pdf, .jpg, .jpeg, .tiff, .gif, .png, .zip .txt'
}
