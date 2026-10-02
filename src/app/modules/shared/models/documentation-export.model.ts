import { EmployeeDocumentFileSearch } from "./employee-document-file-search";
import { FileDocument } from "./file-document.model";
import { ContainerType } from ".";

export interface DocumentationExport extends EmployeeDocumentFileSearch {
  sheetName: string;
  containerType: ContainerType;
  headers: any[];
  selectedDocumentations: FileDocument[];
}
