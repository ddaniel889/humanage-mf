import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  AssignEmployeeToGroupRequest,
  AssignEmployeeToGroupResponse,
  CreateGroupRequest,
  FindGroupEmployeesRequest,
  FindGroupEmployeesResponse,
  FindGroupsRequest,
  FindGroupsResponse,
  FindUngroupedEmployeesResponse,
  UpdateGroupRequest,
} from '../../convenios/models/group';
import { EmployeeFind } from '../models/Employee/employee-find.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private readonly http = inject(HttpClient);
  url = environment.apiUrls.cpp;

  createGroup(body: CreateGroupRequest) {
    return this.http.post(`${this.url}/LeaveGroupOu/Create`, body);
  }

  findGroups(body: FindGroupsRequest) {
    return this.http.put<FindGroupsResponse>(`${this.url}/LeaveGroupOu/FindGroups`, body);
  }

  // Nota de mantenimiento: deprecar y eliminar cuando todos los callers migren a findGroups con payload explícito.
  getGroupByOu(organizationalUnitId: number) {
    return this.findGroups({ organizationalUnitId });
  }

  getDefaultGroupByOu(organizationalUnitId: number) {
    return this.findGroups({ organizationalUnitId }).pipe(
      map((response) => {
        const defaultGroup = response.data.find((group) => group.isDefault);
        if (!defaultGroup) {
          throw new Error(
            `No default leave group found for organizationalUnitId=${organizationalUnitId}`,
          );
        }

        return defaultGroup;
      }),
    );
  }

  getGroupEmployees(params: FindGroupEmployeesRequest) {
    return this.http.post<FindGroupEmployeesResponse>(
      `${this.url}/LeaveGroupOu/FindGroupEmployees`,
      params,
    );
  }

  getEmployeesWithoutGroup(body: EmployeeFind) {
    return this.http.put<FindUngroupedEmployeesResponse>(
      `${this.url}/LeaveGroupOu/SearchEmployeesWithoutGroup`,
      body,
    );
  }

  updateGroup(body: UpdateGroupRequest) {
    return this.http.put(`${this.url}/LeaveGroupOu/Update`, body);
  }

  assignEmployeeToGroup(payload: AssignEmployeeToGroupRequest) {
    return this.http.post<AssignEmployeeToGroupResponse>(`${this.url}/LeaveGroupOu/AssignEmployeeGroup`, payload);
  }
}
