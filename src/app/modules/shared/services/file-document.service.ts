/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, from, Observable, Subject, firstValueFrom } from 'rxjs';
import { map } from "rxjs/operators";
import { Certificate } from "../models/certificate.model";
import { DocumentationGroupData } from "../models/documentation-group-data.model";
import { Employee } from "../models/Employee/employee.model";
import { FileDocumentMetadata } from "../models/file-document-metadata.model";
import { FileDocumentCollaborationData } from "../models/file-document-sign-data.model";
import { FileDocument } from "../models/file-document.model";
import { GroupEmployeeFileDocumentView } from "../models/group-employee-file-document-view.model";
import { OrganizationalUnit } from "../models/organizational-unit.model";
import { IPagedModel } from "../models/paged.model.";
import { AuditService } from "./audit.service";
import { FileService } from "./file.service";
import { DocumentationExport } from "../models/documentation-export.model";
import { EmployeeDocumentFileSearch } from "../models/employee-document-file-search";
import { InboxConfig } from "../models/inbox-config.model";
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { FileDocumentDownload } from "../models/file-document-download.model";
import { environment } from "../../../../environments/environment";
@Injectable({
  providedIn: "root",
})
export class FileDocumentService {
  paginatedResponseDefault: IPagedModel<FileDocument> = {
    values: [],
    itemPerPage: 0,
    page: 0,
    total: 0,
  };

  private readonly cppUrl = environment.apiUrls.cpp;
  private readonly edrUrl = environment.apiUrls.edr;

  pagedEmployeeDocumentsPage = 0;
  pagedEmployeeDocumentsItemsPerPage = 15;
  employeeDocuments = new BehaviorSubject<FileDocument[]>([]);
  pagedEmployeeDocuments = new BehaviorSubject<FileDocument[]>([]);
  selectedData: GroupEmployeeFileDocumentView =
    GroupEmployeeFileDocumentView.Actual;
  inboxConfig: InboxConfig;
  private readonly documentationTypesGroup$ = new Subject<DocumentationGroupData[]>();
  private fileDocumentsGroup$ = new Subject<IPagedModel<FileDocument>>();

  private lawyerFileDocumentsGroup = new Subject<IPagedModel<FileDocument> | void>();
  private readonly lawyerDocumentationTypesGroup = new BehaviorSubject<
    DocumentationGroupData[]
  >([]);
  private fileDocuments = new Subject<IPagedModel<FileDocument>>();

  private readonly CertificateTypePersonID = 0;
  private readonly CertificateTypeLawyerID = 1;
  showButton = false;

  private readonly fileService = inject(FileService);
  private readonly auditService = inject(AuditService);
  private readonly http = inject(HttpClient);

  getDocumentationTypesGroup(): Subject<DocumentationGroupData[]> {
    return this.documentationTypesGroup$;
  }

  subscribeToLawyerDocumentationList() {
    return this.lawyerDocumentationTypesGroup.asObservable();
  }

  mapResponseGroupType(
    ou: OrganizationalUnit,
    res,
    subj: Subject<DocumentationGroupData[]>
  ): DocumentationGroupData[] {
    const items: DocumentationGroupData[] = res.map(
      (element) =>
        new DocumentationGroupData(
          ou,
          element.documentationTypeId,
          element.documentationTypeName,
          element.creationDate,
          element.totalDocuments,
        ),
    );

    items.sort((a, b) => {
      if (a.documentationDate < b.documentationDate) {
        return 1;
      } else if (a.documentationDate > b.documentationDate) {
        return -1;
      }

      if (a.documentationName < b.documentationName) {
        return -1;
      } else if (a.documentationName > b.documentationName) {
        return 1;
      }

      return 0;
    });

    subj.next(items);
    return items;
  }

  refreshDocumentationInProgres(
    ou: OrganizationalUnit
  ): Observable<DocumentationGroupData[]> {
    const params = { organizationalUnitId: ou.id.toString() };
    return this.http
      .get<any[]>(
        `${this.cppUrl}/FileDocuments/GetDocTypesGroup/`,
        { params: params }
      )
      .pipe(
        map((res) =>
          this.mapResponseGroupType(ou, res, this.documentationTypesGroup$)
        )
      );
  }

  refreshDocumentationSignPending(
    ou: OrganizationalUnit
  ): Observable<DocumentationGroupData[]> {
    const params = { organizationalUnitId: ou.id.toString() };
    return from(
      this.http
        .get<any[]>(
          `${this.cppUrl}/LawyerDocuments/GetDocTypesGroup/`,
          { params: params }
        )
        .pipe(
          map((res) =>
            this.mapResponseGroupType(
              ou,
              res,
              this.lawyerDocumentationTypesGroup
            )
          )
        )
    );
  }

  getDocumentationSignPending(
    ou: OrganizationalUnit
  ): Observable<DocumentationGroupData[]> {
    const params = { organizationalUnitId: ou.id.toString() };
    return from(
      this.http
        .get<any[]>(
          `${this.cppUrl}/LawyerDocuments/GetDocTypesGroup/`,
          { params: params }
        )
        .pipe(
          map((res) =>
            this.mapResponseGroupType(
              ou,
              res,
              this.lawyerDocumentationTypesGroup
            )
          )
        )
    );
  }

  getFileDocumentsGroup(): Subject<IPagedModel<FileDocument>> {
    if (this.fileDocumentsGroup$.isStopped) {
      this.fileDocumentsGroup$.complete();
      this.fileDocumentsGroup$ = new Subject<IPagedModel<FileDocument>>();
    }

    return this.fileDocumentsGroup$;
  }

  getLawyerFileDocumentsGroup(): Subject<IPagedModel<FileDocument> | void> {
    if (this.lawyerFileDocumentsGroup.isStopped) {
      this.lawyerFileDocumentsGroup.complete();
      this.lawyerFileDocumentsGroup = new Subject<IPagedModel<FileDocument>>();
    }

    return this.lawyerFileDocumentsGroup;
  }

  getFileDocuments(): Subject<IPagedModel<FileDocument>> {
    if (this.fileDocuments.isStopped) {
      this.fileDocuments.complete();
      this.fileDocuments = new Subject<IPagedModel<FileDocument>>();
    }
    return this.fileDocuments;
  }

  refreshFileDocumentsGroupInProgress(parameters: any) {
    const params = new HttpParams()
      .set("OrganizationalUnitId", parameters.organizationalUnitId)
      .set("DocumentationTypeId", parameters.documentationTypeId)
      .set("CreationDate", parameters.creationDate)
      .set("ItemPerPage", parameters.itemPerPage)
      .set("Page", parameters.page)
      .set("OrderBy", parameters.orderBy)
      .set("OrderAscending", parameters.orderAscendent);

    this.http
      .get<any>(
        `${this.cppUrl}/FileDocuments/getDocumentsGroup`,
        { params }
      )
      .subscribe({
        next: (result) => {
          const items = JSON.parse(result.value);
          const documents = items.map((element) => this.mapSingleResponse(element));

          const pagedResult = {
            values: documents,
            page: parameters.page,
            itemPerPage: parameters.itemPerPage,
            total: result.totalCount,
          };

          this.fileDocumentsGroup$.next(pagedResult);
        },
        error: (error) => this.fileDocumentsGroup$.error(error)
      });
  }

  downloadFileDocumentsGroupSignPending(parameters: any) {
    return this.http.put<any>(
      `${this.cppUrl}/LawyerDocuments/downloadFiltered`,
      parameters
    );
  }

  deleteFileDocumentsGroupSignPending(parameters: any) {
    const params = new HttpParams()
      .set("OrganizationalUnitId", parameters.organizationalUnitId)
      .set("DocumentationTypeId", parameters.documentationTypeId)
      .set("CreationDate", parameters.creationDate)
      .set("ItemPerPage", parameters.itemPerPage)
      .set("Page", parameters.page);

    return this.http.delete<any>(
      `${this.cppUrl}/LawyerDocuments/DeleteBatch`,
      { params }
    );
  }

  refreshFileDocumentsGroupSignPending(parameters: any) {
    const params = new HttpParams()
      .set("OrganizationalUnitId", parameters.organizationalUnitId)
      .set("DocumentationTypeId", parameters.documentationTypeId)
      .set("CreationDate", parameters.creationDate)
      .set("ItemPerPage", parameters.itemPerPage)
      .set("Page", parameters.page)
      .set("OrderBy", parameters.orderBy)
      .set("OrderAscending", parameters.orderAscendent)
      .set("Cuil", parameters.cuil)
      .set("NroLeg", parameters.nroLeg)
      .set("DocumentName", parameters.documentName);

    this.http
      .get<any>(
        `${this.cppUrl}/LawyerDocuments/getDocumentsGroup`,
        { params }
      )
      .subscribe({
        next: (result) => {
          const items = JSON.parse(result.value);
          const documents = items.map((element) => this.mapSingleResponse(element));

          const pagedResult = {
            values: documents,
            page: parameters.page,
            itemPerPage: parameters.itemPerPage,
            total: result.totalCount,
          };

          this.lawyerFileDocumentsGroup.next(pagedResult);
        },
        error: (error) => this.lawyerFileDocumentsGroup.error(error)
      });
  }

  cleanFileDocumentsGroupSignPending() {
    this.lawyerFileDocumentsGroup.next();
  }

  getFileDocumentsGroupSignPending(parameters: any) {
    const params = new HttpParams()
      .set("OrganizationalUnitId", parameters.organizationalUnitId)
      .set("DocumentationTypeId", parameters.documentationTypeId)
      .set("CreationDate", parameters.creationDate);

    return firstValueFrom(
      this.http.get<any>(`${this.cppUrl}/LawyerDocuments/getDocumentsGroup`, { params }).pipe(
        map((res) => {
          const items = JSON.parse(res.value);
          const documents = items.map((element) => this.mapSingleResponse(element));
          return documents;
        })
      ));
  }

  refreshFileDocuments(parameters: any) {
    const param = {
      ItemPerPage: parameters.itemPerPage,
      Page: parameters.page,
      DocumentName: parameters.documentName,
      OrderBy: this.MapFileDocumentMetadata(parameters.orderBy),
      OrderAscending: parameters.orderAscendent,
      OrganizationalUnitId: parameters.organizationalUnitId,
      DocumentationFind: parameters.documentationFind,
      EmployeeFind: parameters.employeeFind,
      ContainerTypeId: parameters.containerTypeId,
      cuil: parameters.cuil,
      nroLeg: parameters.nroLeg,
      statusId: parameters.statusId,
      isFinished: parameters.isFinished,
      fechaDocumentacionFrom: parameters.fechaDocumentacionFrom,
      fechaDocumentacionTo: parameters.fechaDocumentacionTo,
      restrictionFilter: parameters.restrictionFilter,
    };

    this.http
      .put<any>(
        `${this.cppUrl}/FileDocuments/getDocuments`,
        param
      )
      .subscribe({
        next: (result) => {
          const documents = [];
          if (result) {
            const items = JSON.parse(result.value);
            for (const element of items) {
              documents.push(this.mapSingleResponse(element));
            }
          }
          const pagedResult = {
            values: documents,
            page: parameters.page,
            itemPerPage: parameters.itemPerPage,
            total: result ? result.totalCount : 0,
          };

          this.fileDocuments.next(pagedResult);
        },
        error: (error) => this.fileDocuments.error(error)
      });
  }

  refreshDocuments(
    employee: Employee,
    ous: OrganizationalUnit[],
    filteredDocTypes: number[] = [],
    selectedInboxConfig: InboxConfig = null
  ): Observable<FileDocument[]> | void {
    if (employee == null) {
      return;
    }
    if (ous == null) {
      return;
    }

    if (selectedInboxConfig) {
      this.inboxConfig = selectedInboxConfig;
    }

    this.cleanDocuments();
    const orgUnits = [];
    for (const child of ous) {
      orgUnits.push(child.id);
    }
    const param = {
      employeeId: employee.id,
      containerTypeId: employee.containerTypeId,
      documentSearchType: this.selectedData,
      organizationUnitIds: orgUnits,
      documentationTypes: filteredDocTypes,
    };
    return this.http
      .put(`${this.cppUrl}/FileDocuments/find`, param)
      .pipe(map((res) => this.mapResponse(res, false, this.inboxConfig)));
  }

  cleanDocumentationTypesGroup() {
    this.documentationTypesGroup$.next([]);
  }

  cleanLawyerDocumentationTypesGroup() {
    this.lawyerDocumentationTypesGroup.next([]);
  }

  cleanDocuments() {
    this.employeeDocuments.next([]);
    this.pagedEmployeeDocuments.next([]);
    this.pagedEmployeeDocumentsPage = 0;
  }

  mapResponse(
    res,
    isEmployee = false,
    selectedInboxConfig: InboxConfig = null
  ): FileDocument[] {
    const documents: FileDocument[] = [];

    if (selectedInboxConfig) {
      this.inboxConfig = selectedInboxConfig;
    }

    for (const process of res) {
      documents.push(this.mapSingleResponse(process, isEmployee));
    };

    this.employeeDocuments.next(documents);
    if (selectedInboxConfig) {
      this.getMorePagedEmployeeDocuments();
    }
    return documents;
  }

  getMorePagedEmployeeDocuments() {
    this.pagedEmployeeDocumentsPage = this.pagedEmployeeDocumentsPage + 1;
    let items: FileDocument[] = [];
    for (const data of this.employeeDocuments.value) {
      items.push(data);
    }
    if (!this.inboxConfig.isDefaultConfig) {
      items = items.filter((i) =>
        this.inboxConfig.documentationTypeIds.includes(+i.documentationTypeId)
      );
    }

    this.pagedEmployeeDocuments.next(
      items.splice(
        0,
        this.pagedEmployeeDocumentsPage *
        this.pagedEmployeeDocumentsItemsPerPage
      )
    );
  }

  getPagedEmployeeDocuments(page: number, pageSize: number) {
    this.pagedEmployeeDocuments.next([]);
    this.pagedEmployeeDocumentsPage = page - 1;
    this.pagedEmployeeDocumentsItemsPerPage = pageSize;
    let items: FileDocument[] = [];
    for (const data of this.employeeDocuments.value) {
      items.push(data);
    }
    if (!this.inboxConfig.isDefaultConfig) {
      items = items.filter((i) =>
        this.inboxConfig.documentationTypeIds.includes(+i.documentationTypeId)
      );
    }

    this.pagedEmployeeDocuments.next(
      items.splice(
        this.pagedEmployeeDocumentsPage *
        this.pagedEmployeeDocumentsItemsPerPage,
        this.pagedEmployeeDocumentsItemsPerPage
      )
    );
  }

  getPagedEmployeeDocumentsCount(): number {
    if (this.inboxConfig && !this.inboxConfig.isDefaultConfig) {
      let items: FileDocument[] = [];
      for (const data of this.employeeDocuments.value) {
        items.push(data);
      }
      items = items.filter((i) =>
        this.inboxConfig.documentationTypeIds.includes(+i.documentationTypeId)
      );
      return items.length;
    }
    return this.employeeDocuments.value.length;
  }

  showButtonPending(Doctypes: DocumentationType[]): boolean {
    if (Doctypes != undefined) {
      if (this.inboxConfig && !this.inboxConfig.isDefaultConfig) {
        for (const element of Doctypes) {
          for (const document of this.employeeDocuments.value) {
              const metadata = document.metadatas.find(m => m.systemName == '_idDocumentacion');
              if (metadata.metadataValue == element.id && document.isEmployeeActionPending())
              {
                  this.showButton = true;
              }
          }
        }
      }
      for (const element of Doctypes) {
        for (const document of this.employeeDocuments.value) {
            const metadata = document.metadatas.find(m => m.systemName == '_idDocumentacion');
            if (metadata.metadataValue == element.id && document.isEmployeeActionPending())
            {
              this.showButton = true;
            }
        }
      }
    }
    return this.showButton;
  }

  mapResponseSingle(res): FileDocument {
    const doc: FileDocument = this.mapSingleResponseFullDocument(res);
    return doc;
  }

  private mapSingleResponseFullDocument(res): FileDocument {
    const response: FileDocument = new FileDocument();
    if (!res) {
      return response;
    }
    response.id = res.documentId;
    response.name = res.name;
    response.organizationalUnitId = res.organizationalUnitId;
    response.organizationalUnitName = res.organizationalUnitName;
    response.metadatas = [];
    response.hasFiles = res.files && res.files.length > 0;
    response.statusId = res.statusId;
    response.createdByFirstName = res.createdByFirstName;
    response.createdByLastName = res.createdByLastName;
    // Load Values Documentacion
    response.documentationTypeId = this.LoadMetadataValueByKey(
      res,
      FileDocument.idDocumentacionSystemName
    );
    response.documentationTypeName = this.LoadMetadataValueByKey(
      res,
      FileDocument.nomDocumentacionSystemName
    );
    if (this.LoadMetadataValueByKey(res, FileDocument.nroLegSystemName)) {
      response.nroLegajo = this.LoadMetadataValueByKey(
        res,
        FileDocument.nroLegSystemName
      );
    }
    response.employeeFirstName = this.LoadMetadataValueByKey(
      res,
      FileDocument.nameSystemName
    );
    response.employeeLastName = this.LoadMetadataValueByKey(
      res,
      FileDocument.lastNameSystemName
    );
    response.employeeLegalId = this.LoadMetadataValueByKey(
      res,
      FileDocument.cuilSystemName
    );
    response.documentDate = new Date(
      this.LoadMetadataValueByKey(res, FileDocument.dateSystemName)
    );
    response.userId = this.LoadMetadataValueByKey(
      res,
      FileDocument.userIdSystemName
    );
    response.rejectedMotive = res.rejectedMotive;
    response.rejectedDate = res.rejectedDate;
    response.documentFileSignaturesData = res.documentFileSignatures;
    // Metadatos
    for (const meta of res.documentTypes[0].metadatas) {
      if (!response.isMetadataDefault(meta.systemName)) {
        const data = new FileDocumentMetadata();
        data.metadataId = meta.metadataId;
        data.systemName = meta.systemName;
        data.metadataIsRequired = meta.metadataIsRequired;
        data.metadataIsUnique = meta.metadataIsUnique;
        data.metadataLabel = meta.metadataLabel;
        data.metadataType = meta.metadataType;
        data.position = meta.position;
        data.asName = meta.asName;
        data.metadataValueDescription = meta.metadataValueDescription;

        if (data.metadataType === "date") {
          data.metadataValue = new Date(meta.metadataValue);
        } else {
          data.metadataValue = meta.metadataValue;
        }

        response.metadatas.push(data);
      }
    }
    return response;
  }

  private LoadMetadata(doc: any): FileDocumentMetadata {
    return null;
  }

  private LoadMetadataValueByKey(doc: any, key: string): any {
    for (const meta of doc.documentTypes[0].metadatas) {
      if (meta.systemName === key) {
        const resp = meta.metadataValue;
        return resp;
      }
    }
    return null;
  }

  private mapSingleResponse(res, isEmployee = false): FileDocument {
    const response: FileDocument = new FileDocument();
    if (!res) {
      return response;
    }
    response.id = res.did;
    response.name = res.na;
    response.organizationalUnitId = res.ou;
    response.metadatas = [];
    this.setMetadatas(response, res.m);
    response.documentDate = res.m._fecDoc
      ? new Date(+res.m._fecDoc.$date)
      : undefined;
    response.documentTypeSystemName = res.tsn;
    response.hasFiles = res.hf;
    response.statusId = res.dsi;
    response.documentContainerId = res.cid[0] ?? 0;
    // Colaboraciones
    if (res.col != null) {
      for (const colaboracion of res.col) {
        if (colaboracion.u != null) {
          // Colaborado a un Usuario
          response.employeeCollaborationData = this.LoadColaboracion(
            colaboracion,
            res.dfs,
            true,
            response.employeeCollaborationData
          );
        }

        if (!isEmployee && colaboracion.r != null) {
          // Colaborado a un rol
          response.lawyerCollaborationData = this.LoadColaboracion(
            colaboracion,
            res.dfs,
            false,
            response.lawyerCollaborationData
          );
        }
      }
    }

    return response;
  }

  private MapFileDocumentMetadata(metadata: string): string[] {
    const res: string[] = [];

    if (!metadata || metadata.length < 1) {
      res.push("m._nomDocumentacion", "m._ape", "m._nroleg");
      return res;
    }

    switch (metadata[0]) {
      case "documentationType":
        res.push("m._nomDocumentacion");
        break;

      case "date":
        res.push("m._fecDoc");
        break;

      case "nroLegajo":
        res.push("m._nroleg");
        break;

      case "ou":
        res.push("ou");
        break;

      case "employeeLegalId":
        res.push("m._cuil");
        break;

      case "employeeName":
        res.push("m._nom");
        break;

      case "employeeLastName":
        res.push("m._ape");
        break;

      default:
        res.push(`m.${metadata}`);
        break;
    }

    return res;
  }

  private LoadColaboracion(
    colaboracion: any,
    documentFileSignature: any,
    employeeSignature: boolean,
    previousData?: FileDocumentCollaborationData
  ): FileDocumentCollaborationData {
    const data = previousData || new FileDocumentCollaborationData();
    const now = new Date();
    if (colaboracion.a?.e) {
      data.enabled = colaboracion.a.e;
    }

    if (colaboracion.f != null) {
      const date = new Date(
        +colaboracion.f.$date + now.getTimezoneOffset() * 60 * 1000
      );
      data.viewDate =
        data.viewDate && data.viewDate > date ? data.viewDate : date;
    }
    if (colaboracion.a == null) {
      data.requiredSignature = false;
    } else {
      if (colaboracion.a.a === "UPLOAD") {
        data.uploaded = colaboracion.a.f != null;
        if (colaboracion.a.f != null) {
          data.uploadDate = new Date(
            +colaboracion.a.f.$date + now.getTimezoneOffset() * 60 * 1000
          );
        }
      } else {
        if (!data.enabled) {
          data.requiredSignature = true;
        }

        if (colaboracion.a.f == null) {
          if (colaboracion.a.r) {
            data.error = colaboracion.a.r;
          }
          data.signatureState = "no-firmado";
        } else {
          data.signatureDate = new Date(
            +colaboracion.a.f.$date + now.getTimezoneOffset() * 60 * 1000
          );
          data.signatureState = "firmado"; // por defecto sino esta la info de firma
          // Debo buscar la informacion de la firma
          if (employeeSignature) {
            if (documentFileSignature != null) {
              let breakLoop = false;
              for (const dfs of documentFileSignature) {
                if (!breakLoop) {
                  if (dfs.u === colaboracion.u) {
                    if (dfs.sr === "C" || dfs.sr === "c") {
                      data.signatureState = "firmado-conforme";
                    } else {
                      data.signatureState = "firmado-no-conforme";
                      breakLoop = true;
                    }
                  } else if (dfs.ext && dfs.sr) {
                    if (dfs.sr === "C" || dfs.sr === "c") {
                      data.signatureState = "firmado-conforme";
                    }

                    if (dfs.sr === "NC" || dfs.sr === "nc") {
                      data.signatureState = "firmado-no-conforme";
                      breakLoop = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return data;
  }

  getDocumentDetail(id: number): Observable<FileDocument> {
    if (id == null || id == 0) {
      return null;
    }
    return this.http
      .get<FileDocument>(
        `${this.cppUrl}/FileDocuments/${id}`
      )
      .pipe(map((res) => this.mapResponseSingle(res)));
  }

  getMyDocumentDetail(id: number): Observable<FileDocument> {
    if (id == null || id == 0) {
      return null;
    }
    return this.http
      .get<FileDocument>(
        `${this.cppUrl}/FileDocuments/mydocuments/${id}`
      )
      .pipe(map((res) => this.mapResponseSingle(res)));
  }

  getFirmanteDocumentDetail(id: number): Observable<FileDocument> {
    if (id == null || id == 0) {
      return null;
    }
    return this.http
      .get<FileDocument>(
        `${this.cppUrl}/FileDocuments/firmante/${id}`
      )
      .pipe(map((res) => this.mapResponseSingle(res)));
  }

  refreshMyDocuments(
    filteredTypes: number[] = [],
    selectedInboxConfig: InboxConfig = null
  ): Observable<FileDocument[]> {
    this.cleanDocuments();
    const param = {
      documentSearchType: this.selectedData,
      documentationTypes: filteredTypes,
    };

    return this.http
      .put(`${this.cppUrl}/FileDocuments/mydocuments`, param)
      .pipe(map((res) => this.mapResponse(res, true, selectedInboxConfig)));
  }

  mapResponseEmployeeDocuments(res: FileDocument[]): FileDocument[] {
    this.employeeDocuments.next(res);
    return res;
  }

  subscribeToDocumentsList() {
    return this.employeeDocuments.asObservable();
  }

  subscribeToPagedDocumentsList() {
    return this.pagedEmployeeDocuments.asObservable();
  }

  setSelectedPeriod(group: GroupEmployeeFileDocumentView) {
    this.setSelectedDataGroup(group);
  }

  setSelectedDataGroup(group: GroupEmployeeFileDocumentView) {
    this.selectedData = group;
  }

  getDocumentFileName(document: FileDocument): string {
    const date = new Date().toISOString();

    return document.name + ` [${date}].pdf`;
  }

  saveDocument(doc: FileDocument, employeeId: string, autoView: boolean): Promise<void> | void {
    if (document || document.body) {
      return firstValueFrom(this.fileService.getDocumentFilePdfByIdBase64(doc.id, employeeId)).then(
        (file: FileDocumentDownload) => {
          this.fileService.download(file.base64, file.fileName);
          this.auditService.auditSaveEmployeeDocument(doc, autoView);
        }
      );
    }
  }

  saveMultipleDocument(docs: FileDocument[], autoView: boolean): Promise<void> | void {
    if (document || document.body) {
      return firstValueFrom(this.fileService.getMultipleDocumentFilePdfByIdBase64(docs)).then(
        (file) => {
          this.fileService.download(
            file,
            "Documentos " + new Date().toLocaleString(),
            "application/zip"
          );
        }
      );
    }
  }

  saveAllDocuments(param: EmployeeDocumentFileSearch) {
    return firstValueFrom(this.fileService.getAllFilteredDocumentFilePdfByIdBase64(param)).then(
      (file) => {
        this.fileService.download(
          file,
          "Documentos " + new Date().toLocaleString(),
          "application/zip"
        );
      }
    );
  }

  exportDocumentation(model: DocumentationExport): Observable<string> {
    const fileDocument = new FileDocument();

    if (model.headers.length < 1) {
      model.headers = fileDocument.getDocumentationHeaders(model.containerType);
    }

    model.orderBy = this.MapFileDocumentMetadata(model.orderBy.toString());
    return this.http.put<string>(
      `${this.cppUrl}/FileDocuments/ExportXls`,
      model
    );
  }

  signNacion(
    doc: FileDocument,
    certificate: Certificate,
    signatureResult: string,
    urlCallback: string
  ): Observable<any> {
    const param = {
      documentId: doc.id,
      certificateId: certificate.id,
      signatureResult: signatureResult,
      certificateTypeId: this.CertificateTypePersonID,
      documentationTypeId: doc.documentationTypeId,
      urlRedirect: urlCallback,
      certificateSingleSignatureAction: certificate.singleSignatureAction,
      disagreementMotive:
        doc.disagrementMotive.metadataValue == ""
          ? null
          : doc.disagrementMotive,
    };
    return this.http
      .put(`${this.cppUrl}/FileDocuments/SignNacion`, param)
      .pipe(map((res) => this.mapResponseSign(res)));
  }

  signDocument(
    doc: FileDocument,
    certificate: Certificate,
    password: string,
    signatureResult: string
  ): Observable<string> {
    const param = {
      documentId: doc.id,
      certificateId: certificate.id,
      certificateKey: password,
      signatureResult: signatureResult,
      certificateTypeId: this.CertificateTypePersonID,
      documentationTypeId: doc.documentationTypeId,
      certificateSingleSignatureAction: certificate.singleSignatureAction,
      disagreementMotive:
        doc.disagrementMotive.metadataValue == ""
          ? null
          : doc.disagrementMotive,
    };

    return this.http
      .put(`${this.cppUrl}/FileDocuments/sign`, param)
      .pipe(map((res) => this.mapResponseSign(res)));
  }

  signValidatedId(
    doc: FileDocument,
    certificate: Certificate,
    password: string,
    signatureResult: string,
    pIsSigner: boolean
  ): Observable<string> {
    const param = {
      documentId: doc.id,
      certificateId: certificate.id,
      certificateKey: password,
      signatureResult: signatureResult,
      certificateTypeId: this.CertificateTypePersonID,
      documentationTypeId: doc.documentationTypeId,
      certificateSingleSignatureAction: certificate.singleSignatureAction,
      disagreementMotive:
        doc.disagrementMotive.metadataValue == ""
          ? null
          : doc.disagrementMotive,
      fileId: doc.hasFiles,
      isSigner: pIsSigner,
    };

    return this.http
      .put(`${this.cppUrl}/ValidatedId/sign`, param)
      .pipe(map((res) => this.mapResponseSign(res)));
  }

  createMultiplesignDocument(
    docs: FileDocument[],
    certificate: Certificate,
    password: string,
    signatureResult: string
  ): Observable<any> {
    const documentsParam = [];
    for (const element of docs) {
      documentsParam.push({
        key: element.id,
        value: +element.documentationTypeId,
      });
    }
    const param = {
      documents: documentsParam,
      certificateId: certificate.id,
      certificateKey: password,
      signatureResult: signatureResult,
      certificateTypeId: this.CertificateTypeLawyerID,
      certificateSingleSignatureAction: certificate.singleSignatureAction,
    };
    return this.http.put<any>(
      `${this.cppUrl}/FileDocuments/CreateSignProcess`,
      param
    );
  }

  multiplesignDocument(param: any): Observable<any> {
    return this.http.put<any>(
      `${this.cppUrl}/FileDocuments/MultipleSign`,
      param
    );
  }

  signToken(
    docs: FileDocument[],
    rolId: string,
    certificateId: number,
    certificateTypeId: number
  ): Observable<string> {
    const param = [];
    for (const element of docs) {
      const paramDoc = {
        documentId: element.id,
        roleId: rolId,
        certificateId: certificateId,
        certificateKey: null,
        signatureResult: null,
        certificateTypeId: certificateTypeId,
        documentationTypeId: null,
        certificateSingleSignatureAction: null,
      };
      param.push(paramDoc);
    }
    return this.http
      .put(`${this.cppUrl}/FileDocuments/SignToken`, param)
      .pipe(map((res) => this.mapResponseSign(res)));
  }

  callAppToken(
    protocol: string,
    port: number,
    inputUrls: string[]
  ): Observable<any> {
    const urlFirmador =
      protocol + "://localhost:" + port + "/Signer/SignMultiple";
    const outputUrl = `${this.edrUrl}/GetSharing`;
    const postData = {
      input_urls: inputUrls,
      input_credential: "",
      output_url: outputUrl,
      output_credential: "",
      suffix: "",
      returnMultiPart: true,
    };
    return this.http.post(urlFirmador, postData);
  }

  pingToken(protocol: string, port: number): Observable<boolean> {
    const url = protocol + "://localhost:" + port + "/ping";
    return this.http
      .get(url)
      .pipe(map((res) => this.mapResponsePingToken(res)));
  }

  mapResponsePingToken(res): boolean {
    return res;
  }

  shareDocumentBulk(
    docs: FileDocument[],
    roleId: string
  ): Observable<string[]> {
    const param = {
      documents: Array.from(docs, (x) => x.id),
      toSign: true,
      roleId: roleId,
    };

    return this.http
      .put(
        `${this.cppUrl}/FileDocuments/ShareDocumentBulk`,
        param
      )
      .pipe(map((res) => this.mapResponseSignLawyer(res)));
  }

  mapResponseSign(res): string {
    return res;
  }
  mapResponseSignLawyer(res): string[] {
    return res;
  }

  setMetadatas(response: FileDocument, metadatas: any) {
    for (const property in metadatas) {
      if (metadatas.hasOwnProperty(property)) {
        response.setMetadata(property, metadatas[property]);
      }
    }
  }

  delete(id: number) {
    if (id == null || id == 0) {
      return null;
    }

    return this.http.delete(
      `${this.cppUrl}/FileDocuments/${id}`
    );
  }
  // Hace lo mismo que el delete, pero una vez cancelado el usuario, actualiza el set.
  inactive(id: number, setId: number): Observable<any> {
    if (id == null || id == 0) {
      return null;
    }
    const param = {
      id: id,
      setId: setId,
    };
    return this.http.post<any>(`${this.cppUrl}/FileDocuments/Inactive`, param);
  }

  deleteBatch(processId: string, ouid: number) {
    return this.http.delete(
      `${this.cppUrl}/FileDocuments/DeleteBatch/${processId}?ouId=${ouid}`
    );
  }

  cancel(id: number, rejectedMotive: string, setId: number) {
    if (id == null || id == 0) {
      return null;
    }
    const param = {
      id: id,
      rejectedMotive: rejectedMotive,
      setId: setId,
    };
    return this.http.patch(
      `${this.cppUrl}/FileDocuments/Cancel`,
      param
    );
  }


  getCollaboration(
    documentId: number,
    OrganizationalUnitId: number
  ): Observable<any> {
    return this.http
      .get<any>(
        `${this.edrUrl}/Collaboration/${documentId}/${OrganizationalUnitId}`
      )
      .pipe(map((res) => res));
  }

  getSignatures(
    id: number,
  ): Observable<any> {
    return this.http
      .get<any>(
        `${this.edrUrl}/Documents/GetSignatures/${id}`
      )
      .pipe(map((res) => res));
  }

}



export class DocumentStatistic {
  userId: number;
  error = false;
  finishedDocuments: number;
  totalDocuments: number;
  percentage: number;
  state: string;
  Documents: [];
}
