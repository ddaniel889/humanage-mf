import { DocumentationFind } from './documentation-find.model';
import { EmployeeFind } from './employee-find.model';
export interface EmployeeDocumentFileSearch {
  orderBy?: string[];
  orderAscendent?: boolean;
  index?: number;
  isPaged?: boolean;
  itemPerPage?: number;
  page?: number;
  organizationalUnitId?: number;
  documentationFind?: DocumentationFind[];
  employeeFind?: EmployeeFind[];
  creationDate?: any;
  roleId?: string;
  nroLeg?: string;
  cuil?: string;
  documentName: string;
  containerTypeId: number;
  statusId?: number;
  isFinished?:boolean;
  fechaDocumentacionFrom?: Date;
  fechaDocumentacionTo?: Date;
  restrictionFilter?: number;
}
