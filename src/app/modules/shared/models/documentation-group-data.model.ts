import { OrganizationalUnit } from './organizational-unit.model';


export class DocumentationGroupData {
  ou: OrganizationalUnit;
  documentationId: number;
  documentationName: string;
  documentationDate: Date;
  countDocuments: number;

  constructor(
    ou: OrganizationalUnit,
    documentationId: number,
    documentationName: string,
    documentationDate: Date,
    count: number,
  ) {
    this.ou = ou;
    this.documentationId = documentationId;
    this.documentationName = documentationName;
    this.documentationDate = documentationDate;
    this.countDocuments = count;
  }
}
