import { EmployeeMetadata } from "../employee-metadata.model";
import { KeyValuePair } from "../Generics/ikeyValuePair.model";
import { Person } from "./person.model";
import { ContainerType } from "../container-type.model";

export class Employee extends Person {

  public static readonly fechaActivoSystemName = "_factivo";
  public static readonly fechaInactivoSystemName = "_finactivo";

  actions = [];
  avatar: any;
  fechaVencimientoCertificado: Date;
  proveedorCertificado: any;
  hasLeaveConfig:boolean;
  constructor() {
    super();

    this.fixedMedatadas = [
      { key: 1, value: Employee.cuilSystemName  },
      { key: 2, value: Employee.nameSystemName },
      { key: 3, value: Employee.lastNameSystemName },
      { key: 4, value: Employee.mailSystemName  },
      { key: 5, value: Employee.nroLegSystemName },
      { key: 6, value: Employee.userIdSystemName   },
      { key: 7, value: Employee.fechaActivoSystemName  },
      { key: 8, value: Employee.fechaInactivoSystemName },
      { key: 9, value: Employee.estadoSystemName }
    ];
    this.excludedMetadatasFromAdd = [
      Employee.estadoSystemName,
      Employee.userIdSystemName,
      Employee.fechaInactivoSystemName,
      Employee.fechaActivoSystemName
    ];
  }

  public customMetadatas(): EmployeeMetadata[] {
    return this.metadatas.filter(m => m.metadataSystemName != Employee.nroLegSystemName
      && m.metadataSystemName != Employee.nameSystemName
      && m.metadataSystemName != Employee.lastNameSystemName
      && m.metadataSystemName != Employee.cuilSystemName
      && m.metadataSystemName != Employee.mailSystemName
      && m.metadataSystemName != Employee.fechaActivoSystemName
      && m.metadataSystemName != Employee.fechaInactivoSystemName
      && m.metadataSystemName != Employee.userIdSystemName
      && m.metadataSystemName != Employee.estadoSystemName);
  }

  get nroLeg(): string {
    return this.getMetadataValue(Employee.nroLegSystemName);
  } set nroLeg(value: string) {
    this.setMetadataValue(Employee.nroLegSystemName, value);
  }

  get email(): string {
    return this.getMetadataValue(Employee.mailSystemName);
  } set email(value: string) {
    this.setMetadataValue(Employee.mailSystemName, value);
  }

  get userId(): any {
    return this.getMetadataValue(Employee.userIdSystemName);
  }
  set userId(value: any) {
    this.setMetadataValue(Employee.userIdSystemName, value);
  }


  get activeDate(): string {
    return this.getMetadataValue(Employee.fechaActivoSystemName);
  }

  get inactiveDate(): Date {
    return this.getMetadataValue(Employee.fechaInactivoSystemName);
  }

  get nroLegSystemName(): string {
    return 'm.' + Employee.nroLegSystemName;
  }

  get fechaActivoSystemName(): string {
    return 'm.' + Employee.fechaActivoSystemName;
  }


  get isActive(): boolean {
    return this.inactiveDate == null && this.state != 'Inactivo';
  }

  public getEmployeeClass() {
    return this.isActive ? '' : 'disabled';
  }

  getDocumentationHeaders(containerType: ContainerType): any[] {
    const headers: KeyValuePair<string, any>[] = [];

    headers.push({
      key: Employee.lastNameSystemName,
      value: {
        metadataLabel: "Apellido",
        metadataType: "text"
      }
    });

    headers.push({
      key: Employee.nameSystemName,
      value: {
        metadataLabel: "Nombre",
        metadataType: "text"
      }
    });

    headers.push({
      key: Employee.nroLegSystemName,
      value: {
        metadataLabel: "Nro Legajo",
        metadataType: "text"
      }
    });

    headers.push({
      key: Employee.cuilSystemName,
      value: {
        metadataLabel: containerType.label,
        metadataType: "text",
        metadataMask: containerType.mask
      }
    });

    return headers;
  }
}
