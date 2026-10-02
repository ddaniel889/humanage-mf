import { DocumentationType } from './documentation-type.model';
import { FileDocumentMetadata } from './file-document-metadata.model';
import { FileDocumentCollaborationData } from './file-document-sign-data.model';
import { FileDocumentState } from './file-document-state.model';
import { ContainerType } from '.';
import { KeyValuePair } from './Generics/ikeyValuePair.model';
import { DocumentFileSignaturesData } from './documentFileSignatures.model';

export class FileDocument {
  public static readonly nroLegSystemName = '_nroleg';
  public static readonly nameSystemName = '_nom';
  public static readonly lastNameSystemName = '_ape';
  public static readonly cuilSystemName = '_cuil';
  public static readonly dateSystemName = "_fecDoc";
  public static readonly idDocumentacionSystemName = "_idDocumentacion";
  public static readonly nomDocumentacionSystemName = "_nomDocumentacion";
  public static readonly userIdSystemName = "_userId";
  public static readonly periodSystemName = "_peri";

  id: number;
  name: string;
  organizationalUnitId: number;
  organizationalUnitName: string;
  documentTypeSystemName: string;
  metadatas: FileDocumentMetadata[];
  metadatasCarpeta: FileDocumentMetadata[];
  state: FileDocumentState;
  selected: boolean;
  employeeCollaborationData: FileDocumentCollaborationData;
  lawyerCollaborationData: FileDocumentCollaborationData;
  sequence: any;
  documentationTypeSelected: DocumentationType;
  containerTypeId: number;
  documentContainerId: number;
  disagrementMotive: FileDocumentMetadata;
  formioFormAlias: string;
  formioSubmissionId: string;
  hasFiles: boolean;
  statusId?: number;
  documentationTypeSetItemId?: number;
  documentationSetId?: number;
  createdByFirstName: string;
  createdByLastName: string;
  rejectedMotive: string;
  rejectedDate: Date;
  documentFileSignaturesData: DocumentFileSignaturesData[];
  collaboration: any;
  employeeNotifiy:boolean;
  constructor() {
    this.metadatas = [];
    this.metadatasCarpeta = [];
    this.disagrementMotive = new FileDocumentMetadata();
    this.hasFiles = true;
  }

  getDocumentationHeaders(
    containerType: ContainerType,
  ): KeyValuePair<
    string,
    { metadataLabel: string; metadataType: string; metadataMask?: string }
  >[] {
    return [
      {
        key: FileDocument.nomDocumentacionSystemName,
        value: {
          metadataLabel: "Tipo Documentación",
          metadataType: "text"
        }
      },
      {
        key: FileDocument.lastNameSystemName,
        value: {
          metadataLabel: "Apellido",
          metadataType: "text"
        }
      },
      {
        key: FileDocument.nameSystemName,
        value: {
          metadataLabel: "Nombre",
          metadataType: "text"
        }
      },
      {
        key: FileDocument.nroLegSystemName,
        value: {
          metadataLabel: "Nro Legajo",
          metadataType: "text"
        }
      },
      {
        key: FileDocument.cuilSystemName,
        value: {
          metadataLabel: containerType.label,
          metadataType: "text",
          metadataMask: containerType.metadata.find(x => x.legSystemName == FileDocument.cuilSystemName).metadataMask
        }
      },
      {
        key: FileDocument.dateSystemName,
        value: {
          metadataLabel: "Fecha",
          metadataType: "date"
        }
      }
    ];
  }

  isMetadataDefault(systemName: string): boolean {
    switch (systemName) {
      case FileDocument.idDocumentacionSystemName:
      case FileDocument.nomDocumentacionSystemName:
      case FileDocument.nroLegSystemName:
      case FileDocument.nameSystemName:
      case FileDocument.lastNameSystemName:
      case FileDocument.cuilSystemName:
      case FileDocument.dateSystemName:
      case FileDocument.userIdSystemName:
        return true;
      default:
        return false;
    }

  }


  getMetadata(key: string): FileDocumentMetadata {
    if (!this.metadatas) {
      return null;
    }
    const mvalues = this.metadatas.filter(
      item => item.systemName === key
    );
    if (mvalues.length > 0) {
      return mvalues[0];
    }

    return null;
  }



  getMetadataValue(key: string): any {
    const mv = this.getMetadata(key);
    return mv == null ? null : mv.metadataValue;
  }

  setMetadata(key: string, value: any) {
    let metadata = this.getMetadata(key);

    if (metadata != null) {
      metadata.metadataValue = value;
    } else {
      metadata = new FileDocumentMetadata();

      metadata.systemName = key;
      if (!value?.$date) {
        metadata.metadataValue = value;
      } else {
        const now = new Date();
        metadata.metadataValue = new Date(+value.$date + now.getTimezoneOffset() * 60 * 1000);
      }
      metadata.metadataId = 0; // va 0 o null?
      metadata.asName = false;
      metadata.metadataIsRequired = false;
      metadata.metadataIsUnique = false;
      metadata.metadataLabel = null;
      metadata.metadataType = null;
      metadata.metadataValueDescription = null;
      metadata.position = 0;

      this.metadatas.push(metadata);
    }
  }

  setMetadataFull(metadato: any, value: any) {
    let metadata = this.getMetadata(metadato.systemName);

    if (metadata != null) {
      metadata.metadataValue = value;
    } else {
      metadata = new FileDocumentMetadata();

      metadata.systemName = metadato.systemName;
      metadata.metadataValue = value;
      metadata.metadataId = 0; // va 0 o null?
      metadata.asName = metadato.asName;
      metadata.metadataIsRequired = metadato.metadataIsRequired;
      metadata.metadataIsUnique = metadato.metadataIsUnique;
      metadata.metadataLabel = metadato.metadataLabel;
      metadata.metadataType = metadato.metadataType;
      metadata.metadataValueDescription = metadato.metadataValueDescription;
      metadata.position = metadato.position;

      this.metadatas.push(metadata);
    }
  }

  get EmployeeCompleteName(): string {
    return this.employeeFirstName + ' ' + this.employeeLastName;
  }


  get metadataAditional() {
    const metadataDocument = [];
    for (let index = 0, len = this.metadatas.length; index < len; ++index) {
      if (!this.isMetadataDefault(this.metadatas[index].systemName)) {
        metadataDocument.push(this.metadatas[index]);
      }
    }
    return metadataDocument;
  }

  get employeeStateClass() {
    if (this.employeeCollaborationData == null) {
      return null;
    }
    return this.employeeCollaborationData.signatureState;
  }

  get isEmployeeSignable(): boolean {
    if (this.employeeCollaborationData == null) {
      return false;
    }
    return this.employeeCollaborationData.requiredSignature;
  }

  get documentDate(): Date {
    return this.getMetadataValue(FileDocument.dateSystemName);
  }

  set documentDate(value: Date) {
    if (value) {
      this.setMetadata(FileDocument.dateSystemName, value);
    }
  }

  get nroLegajo(): string {
    return this.getMetadataValue(FileDocument.nroLegSystemName);
  }
  set nroLegajo(value: string) {
    this.setMetadata(FileDocument.nroLegSystemName, value);
  }

  get employeeLegalId(): string {
    return this.getMetadataValue(FileDocument.cuilSystemName);
  }
  set employeeLegalId(value: string) {
    this.setMetadata(FileDocument.cuilSystemName, value);
  }

  get employeeFirstName(): string {
    return this.getMetadataValue(FileDocument.nameSystemName);
  }
  set employeeFirstName(value: string) {
    this.setMetadata(FileDocument.nameSystemName, value);
  }

  get employeeLastName(): string {
    return this.getMetadataValue(FileDocument.lastNameSystemName);

  }
  set employeeLastName(value: string) {
    this.setMetadata(FileDocument.lastNameSystemName, value);
  }

  get documentPeriod(): string {
    let value = this.getMetadataValue(FileDocument.periodSystemName);

    if (value.length === 6) {
      value = value.substring(4, 6) + '/' + value.substring(0, 4)
    }

    return value;
  }

  get nroLegSystemName(): string {
    return 'm.' + FileDocument.nroLegSystemName;
  }

  get nameSystemName(): string {
    return 'm.' + FileDocument.nameSystemName;
  }

  get lastNameSystemName(): string {
    return 'm.' + FileDocument.lastNameSystemName;
  }

  get legalIdSystemName(): string {
    return 'm.' + FileDocument.cuilSystemName;
  }
  get dateSystemName(): string {
    return 'm.' + FileDocument.dateSystemName;
  }

  isEmployeeSignPending(): boolean {
    if (this.employeeCollaborationData == null) {
      return false;
    }
    return this.employeeCollaborationData.requiredSignature && this.employeeCollaborationData.signatureDate == null;
  }

  isEmployeeViewPending(): boolean {
    return this.employeeCollaborationData != null && this.employeeCollaborationData.viewDate == null;
  }

  isEmployeeActionPending(): boolean {
    return this.employeeCollaborationData?.isActionPending();
  }

  isUploadPending(): boolean {
    return (this.employeeCollaborationData?.uploaded === false) || !this.hasFiles;
  }


  EmployeeViewedDate(): Date {
    if (this.employeeCollaborationData == null) {
      return null;
    }
    return this.employeeCollaborationData.getViewedDate();
  }

  EmployeeSignatureDate(): Date {
    if (this.employeeCollaborationData == null) {
      return null;
    }
    return this.employeeCollaborationData.getSignatureDate();
  }

  isEmployerViewPending(): boolean {
    return this.lawyerCollaborationData != null && this.lawyerCollaborationData.viewDate == null;
  }

  isEmployerActionPending(): boolean {
    return this.lawyerCollaborationData?.isActionPending();
  }


  EmployerViewedDate(): Date {
    if (this.lawyerCollaborationData == null) {
      return null;
    }
    return this.lawyerCollaborationData.getViewedDate();
  }
  EmployerSignatureDate(): Date {
    if (this.lawyerCollaborationData == null) {
      return null;
    }
    return this.lawyerCollaborationData.getSignatureDate();
  }

  isArchiveSequence(): boolean {
    return this.employeeCollaborationData == null && this.lawyerCollaborationData == null;
  }

  get fileCreationDate(): string {
    return new Date().toISOString();
  }
  set fileCreationDate(value: string) { // chequear el tipo de dato
    this.setMetadata(FileDocument.lastNameSystemName, value);
  }

  get userId(): string {
    return this.getMetadataValue(FileDocument.userIdSystemName);
  }
  set userId(value: string) {
    this.setMetadata(FileDocument.userIdSystemName, value);
  }

  get documentationTypeId(): string {
    return this.getMetadataValue(FileDocument.idDocumentacionSystemName);
  }
  set documentationTypeId(value: string) {
    this.setMetadata(FileDocument.idDocumentacionSystemName, value);
  }

  get documentationTypeName(): string {
    return this.getMetadataValue(FileDocument.nomDocumentacionSystemName);
  }
  set documentationTypeName(value: string) {
    this.setMetadata(FileDocument.nomDocumentacionSystemName, value);
  }

  public requireLawyerSignature(): boolean {
    if (!this.lawyerCollaborationData) {
      return false;
    }

    return this.lawyerCollaborationData.requiredSignature;
  }

  public viewedByLawyer(): boolean {
    if (!this.lawyerCollaborationData) {
      return false;
    }

    if (this.lawyerCollaborationData.viewDate) {
      return true;
    }

    return false;
  }

  public wasSignedByLawyer(): boolean {
    if (!this.lawyerCollaborationData) {
      return false;
    }

    if (this.lawyerCollaborationData.signatureDate) {
      return true;
    }

    return false;
  }

  public requireEmployeeSignature(): boolean {
    if (!this.employeeCollaborationData) {
      return false;
    }

    return this.employeeCollaborationData.requiredSignature;
  }

  public requireEmployeeView(): boolean {
    if (!this.employeeCollaborationData) {
      return false;
    }

    return true;
  }

  public viewedByEmployee(): boolean {
    if (!this.employeeCollaborationData) {
      return false;
    }

    if (this.employeeCollaborationData.viewDate) {
      return true;
    }

    return false;
  }


  public wasSignedByEmployee(): boolean {
    if (!this.employeeCollaborationData) {
      return false;
    }

    if (this.employeeCollaborationData.signatureDate) {
      return true;
    }

    return false;
  }

  public isCanceled(): boolean {
    return this.statusId == StatusDoc.Canceled;
  }

  public getFormiData(): any[] {
    if (!this.metadatas) {
      this.metadatas = [];
    }

    if (!this.metadatasCarpeta) {
      this.metadatasCarpeta = [];
    }

    const listaunion = this.metadatas.concat(this.metadatasCarpeta);

    const formiodata = listaunion.map(m => {
      const rObj = {};
      rObj["f" + m.systemName] = m.metadataValueDescription ?? m.metadataValue;
      return rObj;
    });

    formiodata.push({ organizationalUnitName: this.organizationalUnitName });

    return formiodata;
  }
}


export enum StatusDoc {
  Canceled = 1
}
