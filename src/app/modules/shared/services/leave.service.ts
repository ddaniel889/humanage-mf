import { LeaveApproversFind } from './../models/Employee/leave-approvers-find.model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LeaveRequest } from '../models/leave-request.model';
import { LeaveRequestDetail } from '../../shared/models/leave-request-detail.model';
import { IPagedModel } from '../models/paged.model.';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { LeaveRequestFind, LeaveHolidayFind } from '../models/leave-request-find.model';
import { ConfigLeaveEmployee } from '../models/Employee/config-leave-employee.model';
import { ConfigLeaveEmployeeParams } from '../models/configLeaveEmployeeParams.model';
import { AdditionalDays } from '../models/Employee/additional-type.model';
import { LeaveTimeLine } from '../models/times-lines.model';
import { ConfigLeaveOu } from '../models/Employee/config-leave-ou.model';
import { AprobadoresSearchParams } from '../models/Employee/approvers-search-params.model';
import { LeaveApprovers } from '../models/approvers.model';
import { AssignTimeLines } from '../models/assign-timelines.model';
import { WorkDays } from '../models/work-days.model';
import { LeaveRules } from '../models/leave-rules.model';
import { ValidationRules } from '../models/validation-rules.model';
import { Holiday } from '../models/calendar-holidays';
import { User } from '../models/user.model';
import { Approver } from '../models/Employee/approver.model';
import { environment } from '../../../../environments/environment';
import {
  CreateLeaveTypeOuWithRulesPayload,
  CreateLeaveTypeOuWithRulesResponse,
  LeaveType,
  LeaveTypeOu,
  LeaveTypeDetailDto,
  LeaveTypeOuSummaryResponse,
  UpdateLeaveTypeOuPayload,
  UpdateLeaveTypeOuResponse,
  LeaveTypeGroupResponse,
} from '../models/Employee';

@Injectable()
export class LeaveService {
  private readonly http = inject(HttpClient);

  urlCPP = environment.apiUrls.cpp;
  leavesRequestList = new BehaviorSubject<LeaveRequest[]>([]);
  leavesHolidaysList = new BehaviorSubject<Holiday[]>([]);
  approversList = new BehaviorSubject<LeaveApproversFind[]>([]);
  leavesTimeLinesList = new BehaviorSubject<LeaveTimeLine[]>([]);

  mapResponse(res: IPagedModel<LeaveRequest>): IPagedModel<LeaveRequest> {
    const leavesRequest: LeaveRequest[] = [];
    res.values.forEach(value => {
      leavesRequest.push(this.mapSingleResponse(value));
    });

    const response: IPagedModel<LeaveRequest> = {
      values: leavesRequest,
      itemPerPage: res.itemPerPage,
      page: res.page,
      total: res.total
    };
    this.leavesRequestList.next(leavesRequest);
    return response;
  }

  mapTimeLinesResponse(res: IPagedModel<LeaveTimeLine>): IPagedModel<LeaveTimeLine> {
    const leavestimeslines: LeaveTimeLine[] = [];
    res.values.forEach(value => {
      leavestimeslines.push(this.mapSingleTimeLineResponse(value));
    });

    const response: IPagedModel<LeaveTimeLine> = {
      values: leavestimeslines,
      itemPerPage: res.itemPerPage,
      page: res.page,
      total: res.total
    };
    this.leavesTimeLinesList.next(leavestimeslines);
    return response;
  }

  mapSingleResponse(res: LeaveRequest): LeaveRequest {
    const response: LeaveRequest = {} as LeaveRequest;
    if (!res) {
      return response;
    }
    response.id = res.id;
    response.userId = res.userId;
    response.userName = res.userName;
    response.userIdFiscal = res.userIdFiscal;
    response.requestDate = new Date(res.requestDate);
    response.expirationDate = new Date(res.expirationDate);
    response.startDate = res.startDate != undefined ? new Date(res.startDate) : null;
    response.endDate = res.endDate != undefined ? new Date(res.endDate) : null;
    response.leaveTypeName = res.leaveTypeName;
    response.leaveTypeId = res.leaveTypeId;
    response.stateName = res.stateName;
    response.stateId = res.stateId;
    response.daysConsumed = res.daysConsumed;
    response.organizationalUnitId = res.organizationalUnitId;
    response.actionApprovers = res.actionApprovers;
    response.documentId = res.documentId;
    response.createdBy =  res.createdBy;
    response.leaveTypeOu = res.leaveTypeOu;
    return response;
  }

  mapSingleDetailResponse(res: LeaveRequestDetail): LeaveRequestDetail {
    const response: LeaveRequestDetail = {} as LeaveRequestDetail;
    if (!res) {
      return response;
    }
    response.id = res.id;
    response.userName = res.userName;
    response.userIdFiscal = res.userIdFiscal;
    response.userId = res.userId;
    response.documentId = res.documentId;
    response.userEmail = res.userEmail;
    response.userTelephone = res.userTelephone;
    response.legajo = res.legajo;
    response.requestDate = res.requestDate;
    response.expirationDate = res.expirationDate;
    response.startDate = res.startDate;
    response.endDate = res.endDate;
    response.organizationalUnitId = res.organizationalUnitId;
    response.note = res.note;
    response.configLeaveEmployee = res.configLeaveEmployee;
    response.configLeaveOu = res.configLeaveOu;
    response.state = res.state;
    response.stateHistory = res.stateHistory;
    response.daysConsumed = res.daysConsumed;
    response.note = res.note;
    response.availableDays = res.availableDays ?? 0;
    response.totalDays = res.totalDays ?? 0;
    response.actionApprovers = res.actionApprovers;
    response.createdBy = res.createdBy;
    return response;
  }

  createLeaveRequest(leaveRequest: LeaveRequest) {
    return this.http.post<LeaveRequest>(
      `${this.urlCPP}/leaves`,
      leaveRequest
    );
  }

  getLeaveRequests(param: LeaveRequestFind): Observable<IPagedModel<LeaveRequest>> {
    return this.http
      .put<IPagedModel<LeaveRequest>>(
        `${this.urlCPP}/leaves/Find`,
        param
      )
      .pipe(map(res => this.mapResponse(res)));
  }

  // Metodo para llamar a la api para aprobar o rechazar una solicitud de permiso
  approveOrRejectLeaveRequest(leave: LeaveRequest, approve: boolean) {
    if (approve) {
      return this.http.post<LeaveRequest>(
        `${this.urlCPP}/leaves/Approve`, leave);
    }
    else {
      return this.http.post<LeaveRequest>(
        `${this.urlCPP}/leaves/Decline`, leave);
    }
  }
  approveSelectedLeaveRequests(arrIds: string[]){

      return this.http.post(`${this.urlCPP}/leaves/ApproveSelected`, arrIds);

  }

  ValidateOrRejectLeaveRequest(leave: LeaveRequestDetail, approve: boolean) {
    if (approve) {
      return this.http.post<LeaveRequestDetail>(
        `${this.urlCPP}/leaves/RequestValidate`, leave);
    }
    else {
      return this.http.post<LeaveRequestDetail>(
        `${this.urlCPP}/leaves/Decline`, leave);
    }
  }

  getLeaveRequest(id: string): Observable<LeaveRequestDetail> {
    return this.http
      .get<LeaveRequestDetail>(
        `${this.urlCPP}/leaves/${id}`
      )
      .pipe(map(res => this.mapSingleDetailResponse(res)));
  }


  createConfigEmployee(config: ConfigLeaveEmployeeParams): Observable<ConfigLeaveEmployee> {
    return this.http.post<ConfigLeaveEmployee>(
      `${this.urlCPP}/leaves/ConfigLeaveEmployee`,
      config
    ).pipe(map(res => this.mapConfigLeaveEmployeeSingleResponse(res)));
  }

  createAdditionalDays(additionalDays: AdditionalDays): Observable<AdditionalDays> {
    return this.http.post<AdditionalDays>(
      `${this.urlCPP}/leaves/ConfigLeaveEmployee/AdditionalDays`,
      additionalDays
    );
  }

  deleteAdditionalDays(additionalDayId: number) {
    return this.http
      .delete<LeaveRequestDetail>(
        `${this.urlCPP}/leaves/ConfigLeaveEmployee/AdditionalDays/${additionalDayId}`
      )
  }

  // No se usa
  mapDetailToHeader(detail) {
    throw new Error('Method not used.');

    return {
      id: detail.id,
      userName: detail.userName,
      userIdFiscal: detail.userIdFiscal,
      requestDate: detail.requestDate,
      startDate: detail.startDate != undefined ? new Date(detail.startDate) : null,
      endDate: detail.endDate != undefined ? new Date(detail.endDate) : null,
      expirationDate: detail.expirationDate,
      leaveTypeId: 0,
      leaveTypeName: 'LeaveType Name',
      stateId: 'State Id',
      stateName: 'State Name',
      note: detail.note,
      daysConsumed: detail.daysConsumed,
      selected:false
    };
  }

  getConfigLeaveEmployee(userId: number): Observable<ConfigLeaveEmployee[]> {
    return this.http
      .get<ConfigLeaveEmployee[]>(
        `${this.urlCPP}/leaves/ConfigLeaveEmployee/${userId}`
      )
      .pipe(map(res => this.mapConfigLeaveEmployeeResponse(res)));
  }

  getConfigLeaveByApprover(userId: number): Observable<ConfigLeaveEmployee[]> {
    return this.http
      .get<ConfigLeaveEmployee[]>(
        `${this.urlCPP}/leaves/ConfigLeaveByApprover/${userId}`
      )
      .pipe(map(res => this.mapConfigLeaveEmployeeResponse(res)));
  }

  getEfectivesTimesLines(param: LeaveRequestFind): Observable<IPagedModel<LeaveTimeLine>> {
    return this.http.post<IPagedModel<LeaveTimeLine>>(
        `${this.urlCPP}/leaves/GetEfectiveTimeLines`,param
      )
      .pipe(map(res => this.mapTimeLinesResponse(res)));
  }

  mapConfigLeaveEmployeeResponse(resp: ConfigLeaveEmployee[]): ConfigLeaveEmployee[] {
    const mappedResponses: ConfigLeaveEmployee[] = [];
    for (const res of resp) {
      const response: ConfigLeaveEmployee = {
        id: res.id ?? 0,
        userId: res?.userId ?? 0,
        baseDays: res?.baseDays ?? 0,
        daysConsumed: res?.daysConsumed ?? 0,
        additionalDays: res?.additionalDays ?? [],
        configTimeLines: res?.configTimeLines != null ? this.mapLeaveTimesLinesResponse(res?.configTimeLines) : [],
        configApprovers: res?.configApprovers != null ? this.mapApproversResponseSave(res?.configApprovers) : [],
        additionalDaysSum: res.additionalDaysSum,
        configLeaveOuId: res?.configLeaveOuId ?? 0,
        expirationDate: res?.expirationDate ?? new Date(),
        dateLastModified: res?.dateLastModified ?? new Date(),
        leaveType: res?.leaveType ?? null,
        configLeaveOu:res?.configLeaveOu,
        configEmployeesTimeLines:res?.configEmployeesTimeLines,
        configEmployeeApprovers:res?.configEmployeeApprovers
      };
      mappedResponses.push(response);
    }
    return mappedResponses;
  }
  mapLeaveTimesLinesResponse(resp: LeaveTimeLine[]): LeaveTimeLine[]
  {
    const mappedResponses: LeaveTimeLine[] = [];
    for (const res of resp) {
      const response: LeaveTimeLine = {
        id: res.id,
        configLeaveOuId:res.configLeaveOuId,
        dateFrom: this.getFormattedDate(new Date(res.dateFrom!)),
        dateTo:this.getFormattedDate(new Date(res.dateTo!)),
        description:res.description,
        name:res.description+' - '+this.getFormattedDate(new Date(res.dateFrom!))+'-'+this.getFormattedDate(new Date(res.dateTo!)),
        enabled:res.enabled,
        periodo:res.periodo
      };
      mappedResponses.push(response);
    }
    return mappedResponses;
  }

  mapSingleTimeLineResponse(res: LeaveTimeLine): LeaveTimeLine {
    const response: LeaveTimeLine = new LeaveTimeLine();
    if (!res) {
      return response;
    }
    response.id = res.id;
    response.configLeaveOuId = res.configLeaveOuId;
    response.dateFrom = this.getFormattedDate(new Date(res.dateFrom!));
    response.dateTo = this.getFormattedDate(new Date(res.dateTo!));
    response.description = res.description;
    response.name = res.description+' - '+this.getFormattedDate(new Date(res.dateFrom!))+'-'+this.getFormattedDate(new Date(res.dateTo!));
    response.enabled = res.enabled;
    response.periodo = res.periodo;
    return response;
  }

  mapConfigLeaveEmployeeSingleResponse(resp: ConfigLeaveEmployee): ConfigLeaveEmployee {
    const response: ConfigLeaveEmployee = {
      id: resp.id ?? 0,
      userId: resp?.userId ?? 0,
      baseDays: resp?.baseDays ?? 0,
      daysConsumed: resp?.daysConsumed ?? 0,
      additionalDays: resp?.additionalDays ?? [],
      configTimeLines: resp?.configTimeLines ?? [],
      configApprovers: resp?.configApprovers ?? [],
      additionalDaysSum: resp.additionalDaysSum,
      configLeaveOuId: resp?.configLeaveOuId ?? 0,
      expirationDate: resp?.expirationDate ?? new Date(),
      dateLastModified: resp?.dateLastModified ?? new Date(),
      leaveType: resp?.leaveType ?? null,
      configLeaveOu:resp?.configLeaveOu,
      configEmployeesTimeLines:resp?.configEmployeesTimeLines,
      configEmployeeApprovers:resp?.configEmployeeApprovers
    };
    return response;
  }

    // Metodo para llamar a la api para cancelar una solicitud de permiso
    cancelLeaveRequest(leave: LeaveRequestDetail) {
      return this.http.post<LeaveRequestDetail>(
        `${this.urlCPP}/leaves/Cancel`, leave);
    }
    getFormattedDate(date: Date): string {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear());

      return `${day}/${month}/${year}`;
    }

    newTimeLine(param: LeaveTimeLine): Observable<LeaveTimeLine> {
      return this.http.post<LeaveTimeLine>(
          `${this.urlCPP}/leaves/NewTimeLines`,param
        )
        .pipe(map(res => this.mapSingleTimeLineResponse(res)));
    }

    modifyTimeLine(param: LeaveTimeLine): Observable<LeaveTimeLine> {
      return this.http.put<LeaveTimeLine>(
          `${this.urlCPP}/leaves/ModifyTimeLines`,param
        )
        .pipe(map(res => this.mapSingleTimeLineResponse(res)));
    }

    getConfigLeaveOu(ouId: number): Observable<ConfigLeaveOu[]> {
      return this.http
        .get<ConfigLeaveOu[]>(
          `${this.urlCPP}/leaves/GetConfigLeaveOu/${ouId}`
        )
        .pipe(
          map(res => {
            return res;
          })
        );
    }

    getApproverByUserId(userId: string): Observable<Approver> {
      return this.http.get<Approver>(`${this.urlCPP}/leaves/GetApprover/${userId}`)
      .pipe(map(res => {
        return this.mapSingleApprover(res);
      }));
    }

    mapSingleApprover(param: Approver): Approver{
      return{
        id: param.id,
        firstName: param.firstName,
        lastName: param.lastName,
        enabled: param.enabled,
        idFiscal: param.idFiscal,
        mail: param.mail,
        noLegajo: param.noLegajo,
        userId: param.userId
      }
    }

    mapSingleConfigLeaveOuResponse(res: ConfigLeaveOu): ConfigLeaveOu {
      const response: ConfigLeaveOu = {
        id: res.id ?? 0,
        dateFrom: res?.dateFrom ?? new Date(),
        dateTo: res?.dateTo ?? new Date(),
        description: res?.description ?? '',
        organizationalUnitId: res?.organizationalUnitId ?? 0,
        renewalMonthName: res?.renewalMonthName ?? '',
        renewalMonthKey: res.renewalMonthKey ?? 0,
        leaveTypeOu: res?.leaveTypeOu,
        expirationMonth: res?.expirationMonth ?? 0,
        expirationDays: res?.expirationDays ?? 0,
        year: res?.year ?? '',
        enabled: res.enabled,
        configHolidays: res?.configHolidays ?? []
      };
      return response;
    }

    mapSingleApproversResponse(value: LeaveApproversFind): LeaveApprovers {
      return {
        id: value.userId,
        idFiscal: value.cuil,
        configLeaveOuId: '',
        enabled: value.enabled,
        lastName: value.lastName,
        firstName: value.firstName,
        mail:value.mail,
        userId:value.userId,
        noLegajo: value.nroLegajo,
        name: value.firstName + ' ' + value.lastName + ' ('+value.nroLegajo+')',
        fecha:value?.fecha,
        action:value?.action
      };
    }

    mapSingleApproversResponseSave(value: LeaveApprovers): LeaveApprovers {
      return {
        id: value.userId,
        idFiscal: value.idFiscal,
        configLeaveOuId: '',
        enabled: value.enabled,
        lastName: value.lastName,
        firstName: value.firstName,
        mail:value.mail,
        userId:value.userId,
        noLegajo: value.noLegajo,
        name: value.firstName + ' ' + value.lastName + ' ('+value.noLegajo+')',
        fecha:value?.fecha,
        action:value?.action
      };
    }

    mapApproversResponse(res: LeaveApproversFind[]): LeaveApprovers[] {
      const approvers: LeaveApprovers[] = [];
      res.forEach(value => {
        approvers.push(this.mapSingleApproversResponse(value));
      });

      return approvers;
    }

    mapApproversResponseSave(res: LeaveApprovers[]): LeaveApprovers[] {
      const approvers: LeaveApprovers[] = [];
      res.forEach(value => {
        approvers.push(this.mapSingleApproversResponseSave(value));
      });

      return approvers;
    }
    getApprovers(model: AprobadoresSearchParams): Observable<LeaveApprovers[]> {

      return this.http
        .put<LeaveApproversFind[]>(
          `${this.urlCPP}/leaves/FindApprovers`,
          model
        )
        .pipe(map(res => this.mapApproversResponse(res)));
    }

    getApproversByOu(ouId: number): Observable<LeaveApprovers[]> {

      return this.http
        .get<LeaveApproversFind[]>(
          `${this.urlCPP}/leaves/GetApprovers/${ouId}`,
        )
        .pipe(map(res =>
          this.mapApproversResponse(res)));
    }

    assignSelectedTimeLines(assignTimeLine: AssignTimeLines){
      return this.http.post(`${this.urlCPP}/leaves/AssignTimeLines`,assignTimeLine);
    }

    modifyWorkDays(param: WorkDays): Observable<WorkDays> {
      return this.http.put<WorkDays>(
          `${this.urlCPP}/leaves/UpsertWorkDays`,param
        )
        .pipe(map(res => this.mapSingleWorkDaysResponse(res)));
    }

    getWorkDays(idLeaveTypeOuId: number): Observable<WorkDays> {
      return this.http
      .get<WorkDays>(
        `${this.urlCPP}/leaves/GetWorkDays/${idLeaveTypeOuId}`
      )
      .pipe(map(res => this.mapSingleWorkDaysResponse(res)));
    }

    getLeaveRule(leaveTypeOuId: number): Observable<LeaveRules> {
      return this.http
        .get<LeaveRules>(
          `${this.urlCPP}/leaves/GetLeaveRules/${leaveTypeOuId}`
        );
    }

    postHolidays(param: LeaveHolidayFind): Observable<IPagedModel<Holiday>> {
      return this.http
        .post<IPagedModel<Holiday>>(
          `${this.urlCPP}/leaves/GetHolidays/`,param
        )
        .pipe(map(res =>this.mapPagedHolidays(res)));
    }

    postHolidaysByOuId(param: LeaveHolidayFind): Observable<IPagedModel<Holiday>> {
      return this.http
        .post<IPagedModel<Holiday>>(
          `${this.urlCPP}/leaves/ObtenerHolidayOuId`,param
        )
        .pipe(map(res =>this.mapPagedHolidays(res)));
    }

    upsertLeaveRules(param: LeaveRules) : Observable<LeaveRules>{
      return this.http.post<LeaveRules>(
        `${this.urlCPP}/leaves/UpsertLeaveRule`,param
      );
    }

    getHolidays(idConfigLeaveOu: number){
      return this.http.get<Holiday[]>(
        `${this.urlCPP}/leaves/GetHolidays/${idConfigLeaveOu}`
      )
      .pipe(map(res => this.mapHolidays(res)))
    }

    uploadHoliday(param: Holiday){
      return this.http.post<Holiday>(
        `${this.urlCPP}/leaves/AddHoliday`,param
      ).pipe(map( res => this.mapSingleHoliday(res)));
    }
    updateHoliday(param: Holiday){
      return this.http.put<Holiday>(
        `${this.urlCPP}/leaves/UpdateHoliday`,param
      ).pipe(map( res => this.mapSingleHoliday(res)));
    }

    getLeaveTypeDetail(leaveTypeId: number, ouId: number): Observable<LeaveTypeDetailDto> {
      return this.http.get<LeaveTypeDetailDto>(
        `${this.urlCPP}/leaves/GetDetailLeaveTypeOu/LeaveTypeId/${leaveTypeId}/OrganizationUnit/${ouId}`
      );
    }

    getLeaveTypeOuSummary(ouId: number) {
      return this.http.get<LeaveTypeOuSummaryResponse>(
        `${this.urlCPP}/leaves/GetLeaveTypeOu/OrganizationUnit/${ouId}`,
      );
    }

    getLeaveTypesByGroup(ouId: number, groupId: number) {
      return this.http.get<LeaveTypeGroupResponse[]>(`${this.urlCPP}/leaves/GetLeaveTypesByGroup/${ouId}/${groupId}`);
    }


    getLeaveTypesByOu(ouId: number) {
      return this.http.get<LeaveTypeOu[]>(`${this.urlCPP}/leaves/GetLeaveTypeByOu/${ouId}`);
    }

    /** Devuelve los tipos de licencias que aún no han sido creadas en la organización. */
    getAvailableLeaveTypesByOu(ouId: number) {
      return this.http.get<LeaveType[]>(`${this.urlCPP}/LeaveGroupOu/GetLeaveTypesByOu/${ouId}`);
    }

    updateLeaveTypeOu(params: UpdateLeaveTypeOuPayload) {
      const url = `${this.urlCPP}/leaves/UpdateLeavesTypeOu`;
      return this.http.put<UpdateLeaveTypeOuResponse>(url, params);
    }

    createLeaveTypeOuWithRules(params: CreateLeaveTypeOuWithRulesPayload) {
      const url = `${this.urlCPP}/leaves/LeaveTypeOuWithRules`;
      return this.http.post<CreateLeaveTypeOuWithRulesResponse>(url, params);
    }

    mapSingleWorkDaysResponse(res: WorkDays): WorkDays {
      const response: WorkDays = new WorkDays();
      if (!res) {
        return response;
      }
      response.id = res.id;
      response.workDays = res.workDays;
      response.configLeaveOuId = res.configLeaveOuId;
      response.leaveTypeOuId = res.leaveTypeOuId;
      return response;
    }

    mapPagedHolidays(res: IPagedModel<Holiday>): IPagedModel<Holiday> {
      const holidays: Holiday[] = [];
      res.values.forEach(value => {
        holidays.push(this.mapSingleHoliday(value));
      });


      const response: IPagedModel<Holiday> = {
        values: holidays,
        itemPerPage: res.itemPerPage,
        page: res.page,
        total: res.total
      };

      this.leavesHolidaysList.next(holidays);
      return response;
    }
    mapHolidays(res: Holiday[]): Holiday[] {
      const holidays: Holiday[] = [];
      res.forEach(value => {
        holidays.push(this.mapSingleHoliday(value));
      });

      return holidays;
    }

    mapSingleHoliday(value: Holiday): Holiday{
      return{
        id: value.id,
        holidayType: value.holidayType,
        description: value.description,
        holidayDate: value.holidayDate,
        effectiveHolidayDate: value.effectiveHolidayDate,
        state: value.state,
        configLeaveOuId: value.configLeaveOuId
      }
    }

    getEmployeeIdsByApprove(){
      return this.http.get<number[]>(`${this.urlCPP}/leaves/GetValidatorUserIds`)
      .pipe(map( res => {return res} ));
    }

    mapSingleTeamEmployee(param: User): User{
      return{
        id: param.id,
        firstName: param.firstName,
        lastName: param.lastName,
        organizationalUnitId: param.organizationalUnitId,
        cuil: param.cuil,
        creationDate: param.creationDate,
        enabled: param.enabled,
        mail: param.mail,
        nickName: param.nickName,
        userName: param.userName,
        showCertificate: () => false,
        getTooltipMessage: () => "",
        getRolesTooltipMessage: () => "",
        getRolIconClass: () => ""
      }
    }

    ApprovProposalLeave(leave: LeaveRequestDetail) {
      return this.http.post<LeaveRequestDetail>(
        `${this.urlCPP}/leaves/ApprovProposalLeave`, leave);
    }

    exportLeaves(param: LeaveRequestFind): Observable<string>{
      return this.http.put<string>(`${this.urlCPP}/leaves/ExportLeaves`, param);
    }

  approveAsLeader(leave: LeaveRequestDetail, approve: boolean) {
    if (approve) {
      return this.http.post<LeaveRequest>(`${this.urlCPP}/leaves/ApproveAsLeader`, leave);
    } else {
      return this.http.post<LeaveRequest>(`${this.urlCPP}/leaves/Decline`, leave);
    }
  }


  setConfigLeave(configLeaveOu: ConfigLeaveOu): Observable<ConfigLeaveOu> {
    return this.http.put<ConfigLeaveOu>(`${this.urlCPP}/leaves/ConfigLeaveOu`, configLeaveOu);
  }

  getValidationRules(leaveTypeId: number, configLeaveOuId: number): Observable<ValidationRules> {
    return this.http.get<ValidationRules>(
      `${this.urlCPP}/leaves/validationRules/${leaveTypeId}/configLeaveOu/${configLeaveOuId}`,
    );
  }

  getValidationRulesByOuId(params: { leaveTypeId: number; ouId: number }): Observable<ValidationRules> {
    return this.getValidationRulesAnConfigByOuId(params).pipe(
      map(({ validationRules }) => validationRules),
    );
  }

  getValidationRulesAnConfigByOuId(params: { leaveTypeId: number; ouId: number }): Observable<{
    configLeaveOu: ConfigLeaveOu;
    validationRules: ValidationRules;
  }> {
    return this.getConfigLeaveOu(params.ouId).pipe(
      map((configLeaves) => configLeaves[0]),
      switchMap((configLeaveOu) => {
        if (configLeaveOu?.id == null) {
          return throwError(() => new Error(`No configLeaveOu found for ouId=${params.ouId}`));
        }

        return this.getValidationRules(params.leaveTypeId, configLeaveOu.id).pipe(
          map((validationRules) => ({ configLeaveOu, validationRules })),
        );
      }),
    );
  }
}
