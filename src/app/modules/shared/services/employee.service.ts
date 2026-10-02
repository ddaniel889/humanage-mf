import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Observable, BehaviorSubject } from "rxjs";
import { Employee } from "../models/Employee/employee.model";
import { EmployeeFind } from "../models/Employee/employee-find.model";
import { IPagedModel } from '../models/paged.model.';
import { CertificatePost } from "../models/certificatePost.model";
import { EmployeeFindApprover } from "../models/Employee/employeeFindApprover.model";
import { environment } from "../../../../environments/environment";



@Injectable()
export class EmployeeService {
  private readonly http = inject(HttpClient);

  url = environment.apiUrls.cpp;
  employeeList = new BehaviorSubject<Employee[]>([]);

  mapResponse(res: IPagedModel<Employee>): IPagedModel<Employee> {
    const employees: Employee[] = [];
    res.values.forEach(process => {
      employees.push(this.mapSingleResponse(process));
    });

    const response: IPagedModel<Employee> = {
      values: employees,
      itemPerPage: res.itemPerPage,
      page: res.page,
      total: res.total
    };

    this.employeeList.next(employees);
    return response;
  }

  mapSingleResponse(res: Employee): Employee {
    const response: Employee = new Employee();
    if (!res) {
      return response;
    }

    response.id = res.id;
    response.organizationalUnitId = res.organizationalUnitId;
    response.organizationalUnitName = res.organizationalUnitName;
    response.metadatas = res.metadatas;
    response.containerTypeId = res.containerTypeId;
    response.nickName = res.nickName;
    response.delegatedSystemId = res.delegatedSystemId;
    response.hasActiveCertificate = res.hasActiveCertificate;
    response.preview = res.preview;
    response.hasLeaveConfig = res.hasLeaveConfig;
    return response;
  }

  createEmployee(employee: Employee, sendWelcome = true): Observable<Employee> {
    let params = new HttpParams();
    params = params.append('sendWelcome', sendWelcome.toString());

    return this.http.post<Employee>(
      `${this.url}/Employees`,
      employee, { params: params }
    );
  }

  modifyEmployee(employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(
      `${this.url}/Employees`,
      employee
    );
  }

  updatePhone(phone: string): Observable<Employee> {
    // const phoneNumber = { phone }
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type':'application/json' })
    }
    return this.http.put<Employee>(
      `${this.url}/Containers/UpdatePhone`,'"' + phone +'"',httpOptions);
  }

  deleteEmployee(id: number, disableUser: boolean): Observable<Employee> {
    return this.http.delete<Employee>(
      `${this.url}/Employees/${id}?disableUser=${disableUser}`
    );
  }

  hardDeleteEmployee(employeeid: number, userId: number,isCandidate : boolean) : Observable<boolean> {
    return this.http.delete<boolean>(
      `${this.url}/Employees/HardDelete/${employeeid}/${userId}/${isCandidate}`
    );
  }

  activeEmployee(emp: Employee): Observable<Employee> {
    const param: EmployeeFind = {
      containerTypeId: emp.containerTypeId,
      organizationUnitIds: [emp.organizationalUnitId],
      userid: emp.userId,
      cuil: emp.cuil,
      active: true
    };

    return this.http.put<Employee>(
      `${this.url}/Employees/Active/${emp.id}`, param
    );
  }

  getContainers(model: EmployeeFind): Observable<IPagedModel<Employee>> {
    return this.http
      .put<IPagedModel<Employee>>(
        `${this.url}/Employees/Find`,
        model
      )
      .pipe(map(res => this.mapResponse(res)));
  }

  getContainer(id: string): Observable<Employee> {
    return this.http
      .get<Employee>(
        `${this.url}/Employees/${id}`
      )
      .pipe(map(res => this.mapSingleResponse(res)));
  }

  getTeamContainer(model: EmployeeFind): Observable<IPagedModel<Employee>> {
    return this.http
      .put<IPagedModel<Employee>>(
        `${this.url}/leaves/GetTeamEmployees`,
        model
      )
      .pipe(map(res => this.mapResponse(res)));
  }

  getTeamEmployee(model: EmployeeFindApprover): Observable<Employee> {
    return this.http
      .put<Employee>(
        `${this.url}/leaves/GetTeamEmployeeById`,
        model
      )
      .pipe(map(res => this.mapSingleResponse(res)));
  }

  certificateDeclaration(certificate: CertificatePost, files: File[]) {
    const formData: FormData = new FormData();
    if (files && files.length > 0) {

      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        formData.append(file.name, file, file.name);
      }
    }
    formData.append('dto', JSON.stringify(certificate));
    return this.http.post(`${this.url}/Employees/CertDeclaration`, formData);
  }

  getShareEmployeeNotif(id: string): Observable<Employee> {
    return this.http
      .get<Employee>(
        `${this.url}/Employees/ShareEmployeeNotif/${id}`
      )
      .pipe(map(res => this.mapSingleResponse(res)));
  }

  sharePerson(dto: any) {
    return this.http
      .post<Employee>(
        `${this.url}/Employees/ShareEmployee`,
        dto
      )
      .pipe(map(res => this.mapSingleResponse(res)));
  }
}
