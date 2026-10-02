import { UserCertificateFind } from "./user-certifacte-find.model";
import { EmployeeFind as SegmentMetadata } from "../employee-find.model";

export interface EmployeeFind {
  organizationUnitIds?: number[];
  containerTypeId?: number;
  cuil?: string;
  nroLegajo?: string;
  name?: string;
  orderBy?: string[];
  orderAscendent?: boolean;
  index?: number;
  isPaged?: boolean;
  itemPerPage?: number;
  page?: number;
  active?: boolean;
  userid?: number;
  idUsers?: number[],
  certificateParamter?: UserCertificateFind;
  metadataParameters?: SegmentMetadata[];
  hasLogin?: boolean;
  isSearchAdd?: boolean;
}
