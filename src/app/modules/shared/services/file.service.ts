import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileDocument } from '../models/file-document.model';
import { EmployeeDocumentFileSearch } from '../models/employee-document-file-search';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  readonly url = environment.apiUrls.wf;
  readonly cppUrl = environment.apiUrls.cpp;

  fileBase64: any;
  private readonly http = inject(HttpClient);

  getEmployeeProcessFileById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.url}/Files/` + id);
  }

  getDocumentFilePdfByIdBase64(id: number, employeeId: string): Observable<any> {
    const param = {
      employeeId: employeeId,
      documentId: id
    };
    return this.http
      .put<any>(`${this.cppUrl}/FileDocuments/generatePdf`, param);
  }

  getMultipleDocumentFilePdfByIdBase64(docs: FileDocument[]): Observable<string> {
    const docList = docs.map(doc => {
      const param = {
        Id: 0,
        FolderName: "",
        UserId:"",
        OrganizationalUnitId:0,
      };

      param.Id = doc.id;
      param.FolderName = doc.documentationTypeName + "_" + doc.employeeLegalId;
      param.UserId = doc.userId;
      param.OrganizationalUnitId = doc.organizationalUnitId;
      return param;
    });

    return this.http
      .put<any>(`${this.cppUrl}/FileDocuments/masiveDownload`, docList);
  }

  getAllFilteredDocumentFilePdfByIdBase64(param: EmployeeDocumentFileSearch): Observable<string> {
    return this.http
      .put<any>(`${this.cppUrl}/FileDocuments/downloadFiltered`, param);
  }

  getMyDocumentFilePdfByIdBase64(id: number): Observable<string> {
    const param = {
      documentId: id
    };
    return this.http
      .put<any>(`${this.cppUrl}/FileDocuments/mydocuments/generatePdf`, param);
  }

  getFirmanteDocumentFilePdfByIdBase64(id: number): Observable<string> {
    const param = {
      documentId: id
    };
    return this.http
      .put<any>(`${this.cppUrl}/FileDocuments/firmante/generatePdf`, param);
  }


  convertBase64ToBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  isPDF(file?: File, fileName?: string) {
    if (!file && !fileName) {
      return false;
    }

    const name = fileName || file.name;
    return name.substring(name.lastIndexOf('.')).toLowerCase() === '.pdf';
  }

  isZIP(file?: File, fileName?: string) {
    if (!file && !fileName) {
      return false;
    }

    const name = fileName || file.name;
    return name.substring(name.lastIndexOf('.')) === '.zip';
  }

  download(base64: string, fileName: string, contentType = 'application/pdf') {
    const blob = this.convertBase64ToBlob(base64, contentType);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    a.remove();
  }

    executeDocumentById(documentId: number) {
    return this.http.put(`${this.url}/WorkFlows/executeDocument/${documentId}`, documentId)
  }
}

export enum FILESIZE {
  B = 1,
  KB = 1024 * B,
  MB = 1024 * KB,
  GB = 1024 * MB,
  TB = 1024 * GB
}
