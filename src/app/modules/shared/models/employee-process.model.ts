import { ProcessFile } from './process-file.model';
import { Metadata } from './metadata.model';

export class EmployeeProcess {
  id: string;
  name: string;
  organizationalUnitId: number;
  organizationalUnitName: string;
  processTypeId: number;
  processTypeName: string;
  stateId: string;
  stateName: string;
  stateAlias: string;
  stateDate: Date;
  stateOwnerEdit: boolean;
  metadataValues: Metadata[];
  files: ProcessFile[];
  viewedDate: Date;

  constructor(
    id: string,
    name: string,
    organizationalUnitId: number,
    organizationalUnitName: string,
    processTypeId: number,
    processTypeName: string,
    stateId: string,
    stateName: string,
    stateAlias: string,
    stateDate: Date,
    stateOwnerEdit: boolean,
    metadataValues: Metadata[],
    files: ProcessFile[],
    viewedDate: Date
  ) {
    this.id = id;
    this.name = name;
    this.organizationalUnitId = organizationalUnitId;
    this.organizationalUnitName = organizationalUnitName;
    this.processTypeId = processTypeId;
    this.processTypeName = processTypeName;
    this.stateId = stateId;
    this.stateName = stateName;
    this.stateAlias = stateAlias;
    this.stateDate = stateDate;
    this.stateOwnerEdit = stateOwnerEdit;
    this.metadataValues = metadataValues;
    this.files = files;
    this.viewedDate = viewedDate;
  }

  get period(): Date {
    const period = this.getMetadata('_peri');

    if (period?.value) {
      return new Date(
        period.value.substring(0, 4) +

        '-' +
        period.value.substring(4, 6) +
        '-01T12:12'
      );
    }
    return null;
  }

  get ViewedDate(): Date {
   if (this.viewedDate && new Date(this.viewedDate).getFullYear() > 1900) {
      return this.viewedDate;
    }

    return null;
  }

  get periodValue(): string {
    const period = this.getMetadata('_peri');

    if (period?.value) {
      return period.value;
    }

    return null;
  }

  get type(): string {
    const trec = this.getMetadata('_trec');
    if (trec?.description) {
      return trec.description;
    }

    return null;
  }

  get typeValue(): string {
    const trec = this.getMetadata("_trec");
    if (trec?.value) {
      return trec.value;
    }

    return null;
  }

  get employeeFile(): string {
    const nleg = this.getMetadata("_nroleg");
    if (nleg?.value) {
      return nleg.value;
    }

    return null;
  }

  get employeeFirstName(): string {
    const firstName = this.getMetadata("_cnombre");
    if (firstName?.value) {
      return firstName.value;
    }

    return null;
  }

  get employeeLastName(): string {
    const lastName = this.getMetadata("_capellido");
    if (lastName?.value) {
      return lastName.value;
    }

    return null;
  }

  get stateClass() {
    const typeSigned = this.getMetadata('_estrec');
    if (typeSigned?.value === 'C') {
      return 'firmado-conforme';
    }

    if (typeSigned?.value === 'NC') {
      return 'firmado-no-conforme';
    }
    return 'no-firmado';
  }

  get stateDescription() {
    const typeSigned = this.getMetadata('_estrec');
    if (typeSigned && (typeSigned.value === 'C' || typeSigned.value === 'NC')) {
      return 'Firmado ' + typeSigned.description;
    }
    return null;
  }

  get signedState() {
    const typeSigned = this.getMetadata('_estrec');
    if (typeSigned?.value) {
      return typeSigned.value;
    }

    return null;
  }

  get isSignable() {
    return this.stateOwnerEdit;
  }

  isViewPending(): boolean {
    return this.stateId === "116";
  }

  get certificateId() {
    const idCert = this.getMetadata("_idCertificado");
    if (idCert?.value) {
      return idCert.value;
    }

    return null;
  }

  get motiveDisagreement() {
    const idCert = this.getMetadata("_motivodisc");
    if (idCert?.value) {
      return idCert.value;
    }

    return null;
  }

  getMetadata(key: string): Metadata {
    if (!this.metadataValues) {
      return null;
    }

    const mvalues = this.metadataValues.filter(
      process => process.systemName === key
    );

    if (mvalues.length > 0) {
      return mvalues[0];
    }

    return null;
  }

  setMetadata(key: string, value: string) {
    let metadata = this.getMetadata(key);

    if (metadata != null) {
      metadata.value = value;
    } else {
      metadata = {
        name: "",
        description: "",
        systemName: key,
        value: value
      };

      this.metadataValues.push(metadata);
    }
  }

  getFileId(): string {
    return this.files ? this.files[0].id : null;
  }

  getFileCreationDate(index: number): string {
    if (this.files[index]) {
      const creationDate = this.files[index].creationDate.toString();

      return creationDate.replace(/:/g, '.');
    }

    return null;
  }
}
