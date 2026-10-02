import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { ContainerType } from "../models/container-type.model";
import { IMassiveRegisterExample } from "../models/massive-register-example-model";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ContainerTypeService {
  url = environment.apiUrls.cpp;
  urlEDR = environment.apiUrls.edr;

  private readonly http = inject(HttpClient);

  mapResponse(res: ContainerType): ContainerType {
    if (!res) {
      return res;
    }

    const response = new ContainerType(
      res.id,
      res.organizationalUnitId,
      res.organizationalUnitName,
      res.metadata
    );

    return response;
  }

  getEmployeeContainerType(ouId: string) {
    return this.getContainerType(ouId, false);
  }

  getCandidateContainerType(ouId: string) {
    return this.getContainerType(ouId, true);
  }



  getContainerType(ouId: string, isCandidate = false): Observable<ContainerType> {
    // Me fijo si lo tengo guardado
    const contType: ContainerType = JSON.parse(localStorage.getItem(`${isCandidate ? 'Candidate' : 'Employee'}CT${ouId}`));
    if (contType) {
      return of(this.mapResponse(contType));
    }

    return this.http
      .get<ContainerType>(`${this.url}/OrganizationalUnits/${ouId}/ContainerType/${isCandidate}`)
      .pipe(
        map(res => {
          if (res == null) {
            throw new Error("ErrorLDConfig");
          }
          // Guardo el ContainerTypeId
          localStorage.setItem(`${isCandidate ? 'Candidate' : 'Employee'}CT${ouId}`, JSON.stringify(res));

          return this.mapResponse(res);
        })
      );
  }

  GetAddContainerType(ouId: string, isCandidate = false): Observable<ContainerType> {
    // Me fijo si lo tengo guardado
    const contType: ContainerType = JSON.parse(localStorage.getItem(`${isCandidate ? 'Candidate' : 'Employee'}CTAdd${ouId}`));
    if (contType) {
      return of(this.mapResponse(contType));
    }

    return this.http
      .get<ContainerType>(`${this.url}/Ouid/${ouId}/ContainerType/${isCandidate}`)
      .pipe(
        map(res => {
          if (res == null) {
            throw new Error("ErrorLDConfig");
          }
          // Guardo el ContainerTypeId
          localStorage.setItem(`${isCandidate ? 'Candidate' : 'Employee'}CTAdd${ouId}`, JSON.stringify(res));

          return this.mapResponse(res);
        })
      );
  }

  getMassiveRegisterExampleInfo(containerTypeId: number) {
    return this.http.get<IMassiveRegisterExample>(`${this.urlEDR}/AdminMassiveRegister/${containerTypeId}`);
  }

  getMassiveRegisterExampleBase64(containerTypeId: number) {
    return this.http.get<string>(`${this.urlEDR}/AdminMassiveRegister/download/${containerTypeId}`);
  }

  cleanStorageContainer(ouId: string) {
    localStorage.removeItem('CandidateCT' + ouId);
    localStorage.removeItem('EmployeeCT' + ouId);
  }
}
