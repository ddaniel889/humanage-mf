/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter, inject, Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { UiNotifications, RRHHNotification, UINotificationDTO } from '../models/ui-notifications.model';
import { DatePipe } from '@angular/common';
import { ProcesResultTotals } from '../models/process-result-totals.model';
import { NotificationProcess } from '../models/ui-notification-process.model';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';


@Injectable()
export class UiNotificationsService {
  @Output() gotoLeave = new EventEmitter<string>();
  @Output() gotoApproverLeave = new EventEmitter<string>();
  @Output() gotoDraftLeave = new EventEmitter<string>();

  readonly cppUrl = environment.apiUrls.cpp;
  readonly notificationProcesses = new BehaviorSubject<NotificationProcess>({
    process: [],
    notifications: [],
    totalNotificationCount: 0
  });

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly datePipe = inject(DatePipe);

  get(userId: any) {
    return this.http
      .get<UINotificationDTO[]>(`${this.cppUrl}/notification?UserId=${userId}`)
      .pipe(map(res => this.mapResponse(res)));
  }

  create(notif: UINotificationDTO) {
    return this.http.post<any>(`${this.cppUrl}/notification`, notif);
  }

  delete(id: string): Observable<any> {
    if (id == null) {
      return null;
    }
    return this.http.delete<UiNotifications[]>(`${this.cppUrl}/notification/${id}`);
  }

  mapResponse(res: UINotificationDTO[]): RRHHNotification[] {
    return res.map(notif => this.mapSingleResponse(notif));
  }

  getMyRunningSignProcess(isPerson: boolean): Observable<ProcesResultTotals[]> {
    const entity = isPerson ? 'person' : 'LawyerDocuments';
    return this.http
      .get<any>(`${this.cppUrl}/${entity}/GetMySignProcess/`)
      .pipe(map(res => res.values as ProcesResultTotals[]))
      ;
  }

  refreshNotifiationProcess(getSignProcess = false, isPerson = false, setFakeNotif = false) {
    const inicio: NotificationProcess = {
      process: [],
      notifications: [],
      totalNotificationCount: 0
    };

    this.notificationProcesses.next(inicio);

    const notifLoading = [];
    notifLoading.push(firstValueFrom(this.get(+this.authService.getUserId())));
    if (getSignProcess) {
      notifLoading.push(firstValueFrom(this.getMyRunningSignProcess(isPerson)));
    }
    notifLoading.push(firstValueFrom(this.get(+this.authService.getUserId())));
    // Verifico si tiene procesos corriendo
    Promise.all(notifLoading)
      .then(data => {
        let not: RRHHNotification[] = [];
        let proc: ProcesResultTotals[] = [];
        not = data[0];
        if (getSignProcess) {
          proc = data[1];
        }
        const notProc: NotificationProcess = {
          process: proc,
          notifications: not,
          totalNotificationCount: proc.length + not.length
        };

        if (setFakeNotif) {
            notProc.totalNotificationCount += 1;
        }
        this.notificationProcesses.next(notProc);
      })
      .catch(e => console.log(e));
  }

  subscribeToNotificationProcess() {
    return this.notificationProcesses.asObservable();
  }

  private mapSingleResponse(res: UINotificationDTO): RRHHNotification {
    const response: RRHHNotification = {
      code: res.code,
      id: res.id,
      creationDate: res.creationDate,
      notif: res
    };

    let entity: any;
    const hasEmployee = JSON.parse(localStorage.getItem("isEmployee")) ?? false;
    switch (res.code) {
      case 'releaseNotes':
        response.description = `¡Actualizamos huManage!`;
        response.subtitle = `Tenemos importantes cambios`;
        response.actionName = `Ver release notes`;
        response.actionIcon = 'fa-file-alt';
        response.action = 'releaseNotes';
        response.icon = 'fa-bullhorn';
      break;
      case 'UPD':
      {
      // Upload Person Docuemnt - Documento subido por un Empleado o Candidato
        response.icon = 'fa-envelope';
        response.action = 'viewUploadedDoc';
        response.description = `Has recibido un nuevo Documento`;
        const datePiped = this.datePipe.transform(response.creationDate, 'dd/MM hh:mm');
        entity = JSON.parse(res.entity);
        response.subtitle = `enviado por ${entity.firstName} ${entity.lastName} el ${datePiped}`;
        response.actionName = entity.documentationTypeName;
        response.actionIcon = 'fa-paperclip';
      }
      break;
      case 'DRM':
      {
        // Document Rejected Motive - Documento rechazado
        response.icon = 'fa-file-times';
        response.action = 'viewUploadedDoc';
        response.description = `Un documento ha sido rechazado`;
          const rejectedDaePiped = this.datePipe.transform(response.creationDate, 'dd/MM hh:mm');
          entity = JSON.parse(res.entity);
          response.subtitle = `rechazado por ${entity.rejectedByFirstName} ${entity.rejectedByLastName} el ${rejectedDaePiped}`;
          response.actionName = entity.documentationTypeName;
          response.actionIcon = 'fa-paperclip';
      }
      break;
      case 'USF':
      {
        // Upload Person Docuemnt - Documento subido por un Empleado o Candidato
        response.icon = 'fa-comment-alt';
        response.action = 'hideNotification';
        entity = JSON.parse(res.entity);
        const dateCreated = this.datePipe.transform(response.creationDate, 'dd/MM hh:mm');
        if (entity.countDocuments > 1) {
          response.description = `Terminamos de firmar ${entity.countDocuments} Documentos`;
        } else {
          response.description = `Terminamos de firmar el Documento`;
        }
        response.subtitle = `Proceso iniciado: ${dateCreated}`;
        break;
      }
      case 'PNC':
        // Person No Certificate - Una persona sin certificado intento firmar un documento
          response.icon = 'fa-exclamation-circle';
          response.action = 'declareCertificate';
          entity = JSON.parse(res.entity);
          response.description = `${entity.firstName} ${entity.lastName} no pudo firmar`;
          response.subtitle = `No tiene firma habilitada`;
          response.actionName = 'Declarar certificado';
          response.actionIcon = 'fa-fingerprint';
      break;
      case 'SP':
        // Share Person  - Compartir datos de una persona a otra empresa
          response.icon = 'fa-share-alt';
          response.action = 'addPerson';
          entity = JSON.parse(res.entity);
          response.description = `Te han compartido los datos de un empleado`;
          response.subtitle = `${entity.firstName} ${entity.lastName} de ${entity.ouNameFrom}`;
          response.actionName = 'Alta de empleado';
          response.actionIcon = 'fa-user';
      break;
      case 'CVR':
      {
        // create vacation request  - alta de solicitud de vacaciones
          response.icon = 'fa-umbrella-beach';
          entity = JSON.parse(res.entity);

            const date = this.datePipe.transform(response.creationDate, 'dd/MM HH:mm');
            response.description = `Se ha creado una nueva solicitud de vacaciones`;
            response.subtitle = `${entity.firstName} ${entity.lastName}  ${date}`;
            response.actionName = 'Ver solicitud vacaciones';
            if(hasEmployee){
              response.action = 'gotoMyLeaveToApprover';
            }
            else {
              response.action = 'gotoLeaveRequest';
            }
      break;
      }
      case 'RRB':
      {
          // reject request borrador - rechazo solicitud borrador
          response.icon = 'fa-umbrella-beach';
          entity = JSON.parse(res.entity);
          const fecha = this.datePipe.transform(response.creationDate, 'dd/MM HH:mm');
          response.description = `Se ha rechazado una propuesta de vacaciones`;
          response.subtitle = `${entity.firstName} ${entity.lastName}  ${fecha}`;
      break;
      }
      case 'ARB':
      {
          // approv request borrador - aprobacion solicitud borrador
          response.icon = 'fa-umbrella-beach';
          entity = JSON.parse(res.entity);
          const dFecha = this.datePipe.transform(response.creationDate, 'dd/MM HH:mm');
          response.description = `Se ha aceptado una propuesta de vacaciones`;
          response.subtitle = `${entity.firstName} ${entity.lastName}  ${dFecha}`;
          response.actionName = 'Ver solicitud vacaciones';
          if(hasEmployee){
            response.action = 'gotoMyLeaveToApprover';
          } else {
            response.action = 'gotoLeaveRequest';
          }
      break;
      }
      default:
        response.description = `Tenes una NNI (notificiación no identificada)`;
        response.icon = 'fa-question-circle';
      break;
    }
    return response;
  }

  renderLeave(id: string)
  {
    this.gotoLeave.emit(id);
  }

  renderEmployeeLeave(id:string) {
    this.gotoApproverLeave.emit(id);
  }

  renderDraftLeave(id:string) {
    this.gotoDraftLeave.emit(id);
  }
}
