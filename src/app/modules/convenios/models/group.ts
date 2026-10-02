import { PaginatedResponse } from '../../shared/models/paginated-response';

export interface EmployeeData {
  userId: number;
  firstName: string;
  groupId: number;
  idFiscal: number;
  lastName: string;
  nroLeg: string;
  area?: string;
  joinedDate?: string;
}

export interface GroupDetails {
  id: number;
  name: string;
  description: string;
  codeCct: string;
  organizationalUnitId: number;
  enabled: boolean;
  isDefault: boolean;
  activeEmployees: number;
}

export interface FindGroupsRequest {
  organizationalUnitId: number;
  name?: string;
  isActive?: boolean;
  leaveTypeId?: number;
  notInLeaveTypeId?: number;
  page?: number;
  itemPageSize?: number;
}

export interface CreateGroupRequest {
  codeCct: string;
  description: string;
  id: number;
  isActive: boolean;
  isDefault: boolean;
  name: string;
  organizationalUnitId: number;
}

export interface UpdateGroupRequest {
  id: number;
  description: string;
  isActive: boolean;
  name: string;
  organizationalUnitId: number;
  reference: string;
}

export interface FindGroupsResponse {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  data: GroupDetails[];
}

export interface FindGroupEmployeesRequest {
  groupId: number;
  organizationalUnitId: number;
  currentPage?: number;
  itemPageSize?: number;
  name?: string;
}
export interface UngroupedEmployeeData {
  id: number;
  userName: string;
  userLastName: string;
  cuil: string;
  nroLegajo: string;
  userId: number;
}

export interface AssignEmployeeToGroupRequest {
  GroupId: number;
  UserIds: number[];
  OrganizationalUnitId: number;
}

export interface AssignEmployeeToGroupError {
  userId: number;
  message: string;
}

export interface AssignEmployeeToGroupResponse {
  groupId: number;
  organizationalUnitId: number;
  name: string;
  id: number;
  totalRequested: number;
  totalAssigned: number;
  totalCreated: number;
  totalUpdated: number;
  totalFailed: number;
  createdUserIds: number[];
  updatedUserIds: number[];
  errors: AssignEmployeeToGroupError[];
}

export type FindGroupEmployeesResponse = PaginatedResponse<{
  activeEmployees: number;
  items: EmployeeData[];
}>;

export type FindUngroupedEmployeesResponse = PaginatedResponse<UngroupedEmployeeData[]>;

export interface EmployeeFilter {
  fiscalId: string;
  fileNumber: string;
  fileStatusActive: boolean;
  fileStatusInactive: boolean;
  signConditionEnabled: boolean;
  signConditionPending: boolean;
  signConditionDisabled: boolean;
  humanageAccessAccessed: boolean;
  humanageAccessNotAccessed: boolean;
}
