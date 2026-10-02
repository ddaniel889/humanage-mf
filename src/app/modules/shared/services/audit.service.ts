/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Audit, EmployeeProcess } from "../models";
import { FileDocument } from '../models/file-document.model';
import { ActionTypes, AuditParameters } from '../models/audit.model';
import { IPagedModel } from '../models/paged.model.';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  readonly cppUrl = environment.apiUrls.cpp;

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  create(audit: Audit): Observable<Audit> {
    return this.http.post<Audit>(
      `${this.cppUrl}/Audit`,
      audit
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  auditSavePaycheck(process: EmployeeProcess, autoView: boolean) {
    const entity = {
      _trec: process.type,
      _capellido: process.employeeLastName,
      _cnombre: process.employeeFirstName,
      _nroleg: process.employeeFile,
      _peri: process.periodValue,
      _state: process.stateAlias
    };

    this.create({
      id: null,
      entity: JSON.stringify(entity),
      organizationalUnitId: this.authService.getOrganizationId(),
      organizationalUnitName: this.authService.getOrganizationName(),
      userId: Number(this.authService.getUserId()),
      userName: this.authService.getUserNick(),
      applicationId: environment.application.id,
      applicationName: environment.application.code,
      creationDate: new Date(),
      actionType: { id: 58 },
      entityName: null,
      entityid: 0,
      keys: [
        { Key: "USER", Value: Number(this.authService.getUserId()) },
        { Key: "PROCESS", Value: process.id }]
    }).subscribe();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  auditPrintPaycheck(process: EmployeeProcess, autoView: boolean) {
    const entity = {
      _trec: process.type,
      _capellido: process.employeeLastName,
      _cnombre: process.employeeFirstName,
      _nroleg: process.employeeFile,
      _peri: process.periodValue,
      _state: process.stateAlias
    };

    this.create({
      id: null,
      entity: JSON.stringify(entity),
      organizationalUnitId: this.authService.getOrganizationId(),
      organizationalUnitName: this.authService.getOrganizationName(),
      userId: Number(this.authService.getUserId()),
      userName: this.authService.getUserNick(),
      applicationId: environment.application.id,
      applicationName: environment.application.code,
      creationDate: new Date(),
      actionType: { id: 60 },
      entityName: null,
      entityid: 0,
      keys: [
        { Key: "USER", Value: Number(this.authService.getUserId()) },
        { Key: "PROCESS", Value: process.id }]
    }).subscribe();
  }

  auditSaveEmployeeDocument(doc: FileDocument, autoView: boolean) {
    let actionTypeId: number;
    const auditKeys: (any) = [{ Key: "USER", Value: Number(this.authService.getUserId()) }, { Key: "FILEDOCUMENT", Value: doc.id }];
    const entityEmployeeDocument = this.getAuditEntityForEmployeeDocument(doc);
    if (autoView) {
      actionTypeId = 73;
    } else {
      actionTypeId = 70;
    }

    this.create({
      id: null,
      entity: JSON.stringify(entityEmployeeDocument),
      organizationalUnitId: this.authService.getOrganizationId(),
      organizationalUnitName: this.authService.getOrganizationName(),
      userId: Number(this.authService.getUserId()),
      userName: this.authService.getUserNick(),
      applicationId: environment.application.id,
      applicationName: environment.application.code,
      creationDate: new Date(),
      actionType: { id: actionTypeId },
      entityName: null,
      entityid: 0,
      keys: auditKeys
    }).subscribe();
  }

  private getAuditEntityForEmployeeDocument(doc: FileDocument) {
    return {
      _docId: doc.id,
      _capellido: doc.employeeLastName,
      _cnombre: doc.employeeFirstName,
      _nroleg: doc.nroLegajo,
      _fecdoc: doc.documentDate
    };
  }

  auditPrintEmployeeDocument(doc: FileDocument, autoView: boolean) {
    let actionTypeId: number;
    const auditKeys: (any) = [{ Key: "USER", Value: Number(this.authService.getUserId()) }, { Key: "FILEDOCUMENT", Value: doc.id }];
    const entityEmployeeDocument = this.getAuditEntityForEmployeeDocument(doc);

    if (autoView) {
      actionTypeId = 74;
    } else {
      actionTypeId = 71;
    }

    this.create({
      id: null,
      entity: JSON.stringify(entityEmployeeDocument),
      organizationalUnitId: this.authService.getOrganizationId(),
      organizationalUnitName: this.authService.getOrganizationName(),
      userId: Number(this.authService.getUserId()),
      userName: this.authService.getUserNick(),
      applicationId: environment.application.id,
      applicationName: environment.application.code,
      creationDate: new Date(),
      actionType: { id: actionTypeId },
      entityName: null,
      entityid: 0,
      keys: auditKeys
    }).subscribe();
  }

  get(parameters: any) : Observable<IPagedModel<any>>{
    return this.http.get<IPagedModel<any>>(`${this.cppUrl}/Audit/GetAudits`, { params: parameters });
  }

  getActionTypes(): Observable<any> {
    const actionTypes: ActionTypes = JSON.parse(localStorage.getItem(`actionTypesAudit`));
    if (actionTypes) {
      return of(actionTypes);
    }
    return this.http.get<ActionTypes[]>(`${this.cppUrl}/Audit/GetActionTypes/`).pipe(map(res => {
      localStorage.setItem(`actionTypesAudit`, JSON.stringify(res));
      return res;
    }));
  }

  export(parameters: AuditParameters) {
    return this.http.put<any>(`${this.cppUrl}/Audit/ExportAudits`, parameters);
  }
}
