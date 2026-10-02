import { FileDocument } from "./file-document.model";
import { Employee } from "./Employee/employee.model";
import { OrganizationalUnit } from "./organizational-unit.model";

export class EmployeeFileDocumentDialogData {
  doc: FileDocument;
  employerSign: boolean;
  signEnabled: boolean;
  showDocumentStateBottom: boolean;
  showDocumentState: boolean;
  showDocumentMetadata: boolean;
  employee: Employee;
  orgUnits: OrganizationalUnit[];
  isRRHH = false;
  isFirmante = false;
  isNotifyDocumentVac = true;
  isEmployee = false;
  isModoPDF = false;
}
