import { EmployeeMetadata } from "../employee-metadata.model";
import { ContainerType } from "../container-type.model";
import { KeyValuePair } from "../Generics/ikeyValuePair.model";
import { CandidateSet } from "./candidate-set.model";

export class Person {

  public static readonly cuilSystemName = '_cuil';
  public static readonly nameSystemName = '_nom';
  public static readonly lastNameSystemName = '_ape';
  public static readonly estadoSystemName = '_estado';
  public static readonly nroLegSystemName = '_nroleg';
  public static readonly userIdSystemName = "_userId";
  public static readonly mailSystemName = '_mail';

  id: string;
  organizationalUnitId: number;
  organizationalUnitName: string;
  metadatas: EmployeeMetadata[];
  url: string;
  containerTypeId: number;
  urlBase = location.origin;
  selected: boolean;
  nickName: string;
  delegatedSystemId : string;
  hasActiveCertificate: boolean;
  fixedMedatadas: KeyValuePair<number, string>[];
  actions: any[];
  preview: any;
  certificateProviderId?: number;
  certificateExpirationDate?: Date;
  candidateSet: CandidateSet;
  excludedMetadatasFromAdd: string[];

  constructor() {
    this.url = `${this.urlBase}/#/pwd-first-time/{0}`;
    this.selected = false;
    this.metadatas = [];
  }

  setContainerType(containerType: ContainerType) {
    this.metadatas = containerType.metadata;
    this.containerTypeId = containerType.id;
  }

  cleanContainerType() {
    this.metadatas = [];
    this.containerTypeId = null;
  }

  getMetadataValue(key: string): any {
    const mv = this.getMetadata(key);
    return mv != null ? mv.metadataValue : null;
  }

  protected getMetadata(key: string): EmployeeMetadata {
    if (!this.metadatas) {
      return null;
    }

    let mvalues = this.metadatas.filter(
      employeeFile => employeeFile.metadataSystemName === key
    );

    if (!mvalues) {
      mvalues = this.metadatas.filter(
        employeeFile => employeeFile.legSystemName === key
      );
    }

    if (mvalues.length > 0) {
      return mvalues[0];
    }

    return null;
  }

  protected setMetadata(key: string, value: string) {
    let metadata = this.getMetadata(key);

    if (metadata != null) {
      metadata.metadataValue = value;
    } else {
      metadata = {
        legSystemName: key,
        metadataSystemName: key,
        metadataValue: value,
        metadataId: null,
        optionValues: [],
        metadataType: null,
        isRequired: null,
        isReplicated: null,
        metadataLabel: null,
        metadataMask: null,
        metadataMaskPlaceHolder: null,
        periodPattern: null
      };

      this.metadatas.push(metadata);
    }
  }

  public setMetadataValue(systemName: string, value: any) {
    const metadata = this.getMetadata(systemName);
    if (metadata) {
      metadata.metadataValue = value;
    } else {
      this.metadatas.push(new EmployeeMetadata(systemName, value));
    }
  }

  public setDescriptionValue(systemName: string, value: any) {
    const metadata = this.getMetadata(systemName);
    if (metadata) {
      if (metadata.metadataType === 'comboKV' || metadata.metadataType === 'combo') {
        metadata.descriptionValue = value;
      }
    }
  }

  public customMetadatas(): EmployeeMetadata[] {
    return this.metadatas.filter(m => !this.fixedMedatadas.find(f => f.value === m.metadataSystemName));
  }

  public fixedAddMetadatas(): EmployeeMetadata[] {
    const fixedList: EmployeeMetadata[] = [];
    if (this.metadatas && this.fixedMedatadas && this.fixedMedatadas.length > 0 && this.metadatas.length > 0) {
      this.fixedMedatadas = this.fixedMedatadas.sort((a, b) => (a.key > b.key) ? 1 : -1);
      this.fixedMedatadas.forEach(f => {
        if (!this.excludedMetadatasFromAdd.find(e => e === f.value)) {
          fixedList.push(this.metadatas.find(m => m.metadataSystemName == f.value));
        }
      });
    }
    return fixedList;
  }

  public fixedMetadatas(filterSystemName = ""): EmployeeMetadata[] {
    const fixedList: EmployeeMetadata[] = [];
    if (this.metadatas && this.fixedMedatadas && this.fixedMedatadas.length > 0 && this.metadatas.length > 0) {
      this.fixedMedatadas = this.fixedMedatadas.sort((a, b) => (a.key > b.key) ? 1 : -1);
      this.fixedMedatadas.forEach(f => {
        if (f.value != filterSystemName) {
          fixedList.push(this.metadatas.find(m => m.metadataSystemName == f.value));
        }
      });
    }
    return fixedList;
  }

  get cuil(): string {
    return this.getMetadataValue(Person.cuilSystemName);
  }
  set cuil(value: string) {
    this.setMetadataValue(Person.cuilSystemName, value);
  }

  get name(): string {
    return this.getMetadataValue(Person.nameSystemName);
  }
  set name(value: string) {
    this.setMetadataValue(Person.nameSystemName, value);
  }

  get lastName(): string {
    return this.getMetadataValue(Person.lastNameSystemName);
  }
  set lastName(value: string) {
    this.setMetadataValue(Person.lastNameSystemName, value);
  }

  get userId(): number {
    return this.getMetadataValue(Person.userIdSystemName);
  }
  get state(): string {
    return this.getMetadataValue(Person.estadoSystemName);
  }

  get nameSystemName(): string {
    return 'm.' + Person.nameSystemName;
  }

  get lastNameSystemName(): string {
    return 'm.' + Person.lastNameSystemName;
  }

  get cuilSystemName(): string {
    return 'm.' + Person.cuilSystemName;
  }

  get emailSystemName(): string {
    return 'm.' + Person.mailSystemName;
  }
}

export class PersonPreview {
  id: number;
  organizationalUnitId: number;
  preview: string;
  containerTypeId: number;
  isCandidate: boolean;
}
