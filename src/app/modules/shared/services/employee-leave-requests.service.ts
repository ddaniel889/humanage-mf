import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { EmployeeLeaveRequests } from "../models/Employee/employee-leave-requests.model";
import { map } from "rxjs/operators";
import { Observable, BehaviorSubject } from "rxjs";
import { GroupPeriod } from "../models/GroupPeriod.models";
import { LeaveRequestHeaders } from '../models/Employee/leave-request-header.model';
import { ConfigLeaveEmployee } from "../models/Employee/config-leave-employee.model";
import { ConfigLeaveOu } from "../models/Employee/config-leave-ou.model";
import { environment } from "../../../../environments/environment";


@Injectable()
export class EmployeeLeaveService {
  url = environment.apiUrls.cpp;
  leaveList = new BehaviorSubject<LeaveRequestHeaders[]>([]);
  selectedPeriod: GroupPeriod = GroupPeriod.Actual;
  leaveRequests:LeaveRequestHeaders[];

  private readonly reloadSubject = new BehaviorSubject<boolean>(false);
  reload$ = this.reloadSubject.asObservable();
  triggerReload() {
    this.reloadSubject.next(true);
  }

  private readonly http = inject(HttpClient);

  getLeaveRequests(): Observable<LeaveRequestHeaders[]> {
    return this.http.get<LeaveRequestHeaders[]>(
      `${this.url}/Leaves/GetMyLeavesRequests`).pipe(
      map((res: LeaveRequestHeaders[]) => {
        const mappedResponse = this.mapResponse(res);
        if (mappedResponse.length > 0) {
          return mappedResponse; // Devuelve el primer elemento del array
        } else {
          let leave: LeaveRequestHeaders[]
          return leave;
        }
      })
    );
  }

  private mapResponse(res: any[]): LeaveRequestHeaders[] {
    if (!res || !Array.isArray(res)) {
      console.error('Invalid response format.');
      return [];
    }

    return res.map(item => {
      return {
        id: item.id,
        startDate: item.startDate,
        endDate: item.endDate,
        expirationDate: item.expirationDate,
        userName: item.userName,
        userIdFiscal: item.userIdFiscal.toString(),
        requestDate: item.requestDate,
        leaveTypeName: item.leaveTypeName,
        leaveTypeId: item.leaveTypeId,
        stateName: item.stateName,
        stateId: item.stateId,
        daysConsumed:item.daysConsumed,
        note:item.note,
        createdBy:item.createBy
      };
    });
  }

  subscribeToProcessList() {
    return this.leaveList.asObservable();
  }

  getPendingLeaveTotal(): Observable<number> {
    const param = {
    };

    return this.http
      .put<number>(`${this.url}/LeaveRequests/GetPending`, param);
  }

  getMyConfigLeaveEmployee(): Observable<ConfigLeaveEmployee[]> {
    return this.http.get<ConfigLeaveEmployee[]>(`${this.url}/leaves/GetMyConfigLeaveEmployee`);
  }

  getMyConfigLeaveOU(ouid: number): Observable<ConfigLeaveOu[]> {
    return this.http.get<ConfigLeaveOu[]>(`${this.url}/leaves/GetConfigLeaveOu/${ouid}`);
  }

  getConfigLeaveOUById(id: number): Observable<ConfigLeaveOu> {
    return this.http.get<ConfigLeaveOu>(`${this.url}/leaves/GetConfigLeaveById/${id}`);
  }
  save(leave:any): Observable<EmployeeLeaveRequests[]> {
    return this.http.post<EmployeeLeaveRequests[]>(
      `${this.url}/leaves`,
      leave
    );
  }

  setConfigLeave(configLeaveOu: ConfigLeaveOu): Observable<ConfigLeaveOu> {
    return this.http.put<ConfigLeaveOu>(`${this.url}/leaves/ConfigLeaveOu`, configLeaveOu);
  }
}
