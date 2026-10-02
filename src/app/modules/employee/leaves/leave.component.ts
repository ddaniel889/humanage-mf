import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
  AfterViewChecked,
  computed,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule, MatTabGroup, MatTabChangeEvent } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { EmployeeLeaveService } from '../../shared/services/employee-leave-requests.service';
import { LeaveRequestHeaders } from '../../shared/models/Employee/leave-request-header.model';
import { MessageService } from '../../shared/errorHandler/message.service';
import { LeaveService } from '../../shared/services/leave.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LeaveRequestFind } from '../../shared/models/leave-request-find.model';
import { UiNotificationsService } from '../../shared/services/ui-notifications.service';
import { LeaveStateFind } from '../../shared/models/Employee/leave-state.model';
import { KeyValuePair } from '../../shared/models/Generics/ikeyValuePair.model';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { ConfigLeaveOu } from '../../shared/models/Employee/config-leave-ou.model';
import { ConfigLeaveEmployee } from '../../shared/models/Employee/config-leave-employee.model';
import { ChapaComponent } from '../../shared/chapa/chapa.component';
import { CsPaginatorComponent } from '../../shared/cs-paginator/cs-paginator.component';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink, RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AddLeaveDialogComponent } from './add-leave-dialog/add-leave-dialog.component';
import {
  getLeaveTypeIcon,
  getLeaveTypeKey,
  isVacationLeaveType,
} from '../../shared/models/Employee/leave-type.model';

type LeaveRequestView = LeaveRequestHeaders & { loading?: boolean };

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSelectModule,
    MatTabsModule,
    MatToolbarModule,
    ChapaComponent,
    CsPaginatorComponent,
    RouterLink,
    RouterOutlet,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./leave.component.scss'],
})
export class LeavesComponent implements OnInit, AfterViewChecked {
  private readonly tabGroup = viewChild<MatTabGroup>('tabGroup');
  private readonly employeeLeaveService = inject(EmployeeLeaveService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly leaveService = inject(LeaveService);
  private readonly authService = inject(AuthService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly uiNotificationsService = inject(UiNotificationsService);
  private readonly dialog = inject(MatDialog);

  readonly isLoading = signal(false);
  readonly selectedLeave = signal<LeaveRequestView | undefined>(undefined);
  readonly disabled = signal(false);
  readonly isApprover = signal(false);
  readonly tabToApprover = computed(() => this.isApprover() && this.selectedTabIndex() === 1);
  readonly useWorkflowApprove = signal(false);
  readonly configLeaveEmployee = signal<ConfigLeaveEmployee[]>([]);
  readonly itemsCount = signal<number>(0);

  readonly leaveRequests = signal<LeaveRequestView[]>([]);
  readonly leaveRequestsToApprover = signal<LeaveRequestView[]>([]);
  readonly selectedLeaveStateFind = signal<number>(LeaveStateFind.paraAprobar);
  readonly pageIndex = signal<number>(0);

  private eventRender = false;
  private selectedItem: LeaveRequestView;
  private selectRequestId: string;
  private freeLeave = true;
  private filterByIdNotif: boolean;
  private configLeave: ConfigLeaveOu[];
  private readonly selectedTabIndex = signal<number | undefined>(undefined);

  statesFilters: KeyValuePair<number, string>[] = [
    { key: 6, value: 'Ver Todos' },
    { key: 5, value: 'Para Aprobar' },
    { key: 1, value: 'Solicitudes Pendientes' },
    { key: 2, value: 'Solicitudes Aprobadas' },
    { key: 3, value: 'Solicitudes Rechazadas' },
    { key: 4, value: 'Solicitudes Canceladas' },
    { key: 0, value: 'Solicitudes Borrador' },
  ];

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.selectRequestId = this.selectRequestId ?? param['id'];
    });
    this.filterByIdNotif = this.selectRequestId != null;
    this.subscribeGotoApprover();
    this.employeeLeaveService.reload$.subscribe(async () => {
      this.loadRequestLeave();
      this.findConfigLeaveEmployee();
      this.FindLeaveRequestToApprovers();
      await this.loadLeaveType();
      if (this.tabToApprover()) this.router.navigate(['welcome'], { relativeTo: this.route });
    });
    this.isRequestApprover();
    this.router.navigate(['welcome'], { relativeTo: this.route });
    if (!this.eventRender && this.selectedItem?.id != null) {
      this.loadLeaveToApprover(this.selectedItem.id);
    }
  }

  loadRequestLeave() {
    this.isLoading.set(true);
    try {
      this.getListLeaveRequests();
    } catch (err) {
      this.messageService.showError(err);
    }
  }
  openDetailRequest(id: string) {
    this.router.navigate(['detalle', id, this.isApprover() && this.tabToApprover()], {
      relativeTo: this.route,
    });
    this.isLoading.set(false);
  }

  openAddRequestDialog(): void {
    const data = { configLeaveEmployee: this.configLeaveEmployee() };
    const dialogRef = this.dialog.open(AddLeaveDialogComponent, {
      data,
      disableClose: true,
      panelClass: ['full-screen-dialog', 'mf-hl-tailwind-scope'],
    });
    dialogRef.afterClosed().subscribe((result?: { leaveId: string | null }) => {
      this.loadRequestLeave();
      this.findConfigLeaveEmployee();
      if (result?.leaveId) {
        this.openDetailRequest(result.leaveId);
      }
    });
  }

  getDateRequets(id: string) {
    const detailLeaveRequest =
      this.leaveRequests().find((e) => e.id == id) ??
      this.leaveRequestsToApprover().find((e) => e.id == id);
    if (detailLeaveRequest) {
      return detailLeaveRequest.requestDate;
    }
    return '';
  }

  getDaysRequets(id: string) {
    const detailLeaveRequest = this.leaveRequests().find((e) => e.id == id);
    if (detailLeaveRequest) {
      const startDate = new Date(detailLeaveRequest.startDate);
      const endDate = new Date(detailLeaveRequest.endDate);
      const differenceInTime = endDate.getTime() - startDate.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
      return differenceInDays;
    }
    return '';
  }

  getFormattedDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    return `${day}/${month}/${year}`;
  }

  getTypeRequestName(id: string): string {
    return this.getAttributeDetail(id, 'name');
  }
  getName(id: string): string {
    return this.getAttributeDetail(id, 'state');
  }
  getTypeRequestIcon(id: string): string {
    return this.getAttributeDetail(id, 'icon');
  }

  getTypeRequestDetailIcon(id: string): string {
    return this.getAttributeDetail(id, 'detailIcon');
  }

  getClassNameColor(id: string) {
    return this.getAttributeDetail(id, 'classNameColor');
  }

  getStatusName(id: string) {
    return this.getAttributeDetail(id, 'statusName');
  }

  getTypeLeave(id: string) {
    return this.getAttributeDetail(id, 'typeName');
  }

  getAttributeDetail(id: string, attr: string) {
    const detailLeaveRequest =
      this.leaveRequests().find((e) => e.id == id) ??
      this.leaveRequestsToApprover().find((e) => e.id == id);

    if (!detailLeaveRequest) return '';

    if (attr === 'name') {
      const leaveTypeName = detailLeaveRequest.leaveTypeName?.trim();
      return getLeaveTypeKey(detailLeaveRequest.leaveTypeId, leaveTypeName || 'Licencia');
    }

    if (attr == 'state') {
      switch (detailLeaveRequest.stateId) {
        case '0':
          return 'propuestas';
        case '1':
          return 'solicitadas';
      }
    }

    if (attr === 'icon') {
      if (
        isVacationLeaveType(detailLeaveRequest.leaveTypeId) &&
        (detailLeaveRequest.startDate == null || detailLeaveRequest.endDate == null)
      ) {
        return 'fa-money-check';
      }
      return getLeaveTypeIcon(detailLeaveRequest.leaveTypeId);
    }

    if (attr === 'detailIcon') {
      switch (detailLeaveRequest.stateName) {
        case 'PENDIENTE':
          return 'fa-hourglass-half';
        case 'RECHAZADO':
          return 'fa-thumbs-down';
        case 'APROBADO':
          return 'fa-thumbs-up';
        case 'CANCELADO':
          return 'fa-times-circle';
        case 'BORRADOR':
          return 'fa-pencil-alt';
      }
    }

    if (attr === 'classNameColor') {
      switch (detailLeaveRequest.stateName) {
        case 'PENDIENTE':
          return 'pending';
        case 'RECHAZADO':
          return 'not-ok';
        case 'APROBADO':
          return 'ok';
        case 'CANCELADO':
          return 'cancel';
        case 'BORRADOR':
          return 'draft';
      }
    }

    if (attr === 'statusName') {
      switch (detailLeaveRequest.stateName) {
        case 'PENDIENTE':
          return 'Solicitud Pendiente';
        case 'RECHAZADO':
          return 'Solicitud Rechazada';
        case 'APROBADO':
          return 'Solicitud Aprobada';
        case 'CANCELADO':
          return 'Solicitud Cancelada';
        case 'BORRADOR':
          return 'Solicitud Propuesta';
      }
    }

    if (attr === 'typeName') {
      if (detailLeaveRequest.stateName == 'BORRADOR') {
        return 'propuestos ';
      } else {
        return 'solicitados ';
      }
    }

    return '';
  }

  reloadLeaves(componentRef) {
    componentRef.reloadEvent?.subscribe(() => {
      this.refresh();
    });
  }

  refresh() {
    this.pageIndex.set(0);
    this.loadRequestLeave();
    this.loadRequestToToApprovers();
  }

  selectLeave(leave: LeaveRequestView) {
    this.selectedLeave.set(leave);
    leave.loading = true;
    if (this.selectLeave) {
      this.openDetailRequest(leave.id);
      leave.loading = false;
    }
  }

  getListLeaveRequests() {
    try {
      this.employeeLeaveService
        .getLeaveRequests()
        .toPromise()
        .then(
          (data) => {
            if (data != undefined) {
              this.leaveRequests.set(data);
            }
            this.isLoading.set(false);
          },
          (error) => {
            this.messageService.showError(error);
            this.isLoading.set(false);
          },
        );
    } catch (error) {
      this.messageService.showError(error);
      this.isLoading.set(false);
    }
  }

  private findConfigLeaveEmployee() {
    this.employeeLeaveService
      .getMyConfigLeaveEmployee()
      .toPromise()
      .then((configLeave) => {
        localStorage.setItem('configLeave', JSON.stringify(configLeave));
        this.configLeaveEmployee.set(configLeave);
        if (configLeave.length > 0) {
          this.disabled.set(configLeave[0].configEmployeesTimeLines.length == 0);
          if (this.disabled()) {
            this.messageService.showInfo('No posee asignado vigencias');
          }
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  isRequestApprover() {
    this.leaveService
      .getApproverByUserId(this.authService.getUserId())
      .toPromise()
      .then((approver) => {
        this.isApprover.set(approver !== null);
        this.fixTabIndex();
      });
  }

  FindLeaveRequestToApprovers() {
    this.selectedLeave.set(undefined);
    if (this.filterByIdNotif) this.selectedLeaveStateFind.set(6);
    const param: LeaveRequestFind = {
      filterId: this.filterByIdNotif ? this.selectRequestId : null,
      itemPerPage: 15,
      isPaged: true,
      page: this.pageIndex() == 0 ? 1 : this.pageIndex(),
      stateId: this.filterByIdNotif ? '' : this.selectedLeaveStateFind().toString(),
      organizationalUnitId: Number.parseInt(this.authService.getOrganizationId()),
      approverId: Number.parseInt(this.authService.getUserId()),
    };
    this.leaveService
      .getLeaveRequests(param)
      .toPromise()
      .then((leaves) => {
        if (leaves != undefined) {
          this.leaveRequestsToApprover.set(leaves.values);
          this.itemsCount.set(leaves.total);
          this.pageIndex.set(leaves.page);
          this.filterByIdNotif = false;
          if (this.selectRequestId != null && this.selectRequestId != undefined) {
            this.selectedItem = this.leaveRequestsToApprover().find(
              (x) => x.id == this.selectRequestId,
            );
            if (this.selectedItem) {
              this.isApprover.set(true);
              this.selectLeave(this.selectedItem);
              this.setSelectTab(1);
            } else {
              this.router.navigate(['welcome'], { relativeTo: this.route });
            }
          } else {
            this.router.navigate(['welcome'], { relativeTo: this.route });
          }
        }
        this.isLoading.set(false);
      });
  }

  async loadLeaveType() {
    this.configLeave = this.localStorage.get('configOU');
    const currentOu = this.localStorage.get('organizationId');
    this.leaveService
      .getLeaveTypesByOu(+currentOu)
      .toPromise()
      .then(
        (data) => {
          this.useWorkflowApprove.set(data.some((lt) => lt.workflowApprove != null));
        },
        (err) => {
          this.messageService.showError(err);
        },
      );
  }

  selectedPageChanged(a) {
    this.isLoading.set(true);
    this.FindLeaveRequestToApprovers();
  }

  onTabChange(value: MatTabChangeEvent) {
    this.router.navigate(['welcome'], { relativeTo: this.route });
    this.selectedTabIndex.set(value.index);
    if (value.index === 1 && this.selectedItem?.id !== undefined) {
      this.openDetailRequest(this.selectedItem.id);
    }
  }

  subscribeGotoApprover() {
    if (this.selectRequestId) {
      this.freeLeave = true;
    }
    this.uiNotificationsService.gotoApproverLeave.subscribe((id) => {
      this.eventRender = true;
      this.selectRequestId = id;
      this.filterByIdNotif = true;
      this.loadLeaveToApprover(this.selectRequestId);
    });
  }

  subscribeGotoDraftApprov() {
    if (this.selectRequestId) {
      this.freeLeave = true;
    }
    this.uiNotificationsService.gotoDraftLeave.subscribe((id) => {
      this.eventRender = true;
      this.selectRequestId = id;
      this.selectedItem = this.leaveRequestsToApprover().find((x) => x.id == this.selectRequestId);
      this.setSelectTab(0);
      this.selectLeave(this.selectedItem);
    });
  }

  onLeaveStateChange(state: number): void {
    this.selectedLeaveStateFind.set(state);
    this.loadRequestToToApprovers();
  }

  loadRequestToToApprovers() {
    this.pageIndex.set(0);
    this.isLoading.set(true);
    this.FindLeaveRequestToApprovers();
  }

  loadLeaveToApprover(id: string) {
    if (id != undefined && id != null) {
      if (this.eventRender) {
        this.FindLeaveRequestToApprovers();
      }
    }
  }

  ngAfterViewChecked() {
    if (
      this.tabGroup() &&
      this.freeLeave &&
      this.selectRequestId != null &&
      this.selectRequestId != undefined
    ) {
      this.freeLeave = false;
      this.setSelectTab(1);
      this.FindLeaveRequestToApprovers();
      this.filterByIdNotif = false;
    }
  }

  getTextChapa(stateId: number): string {
    switch (stateId) {
      case 1:
        return 'Aún no tienes licencias pendientes de tu equipo...';
      case 2:
        return 'Aún no tienes licencias aprobadas de tu equipo...';
      case 3:
        return 'Aún no tienes licencias rechazadas de tu equipo...';
      case 4:
        return 'Aún no tienes licencias canceladas de tu equipo...';
      case 5:
        return 'Aún no tienes licencias para aprobar...';
      case 0:
        return 'Aún no tienes licencias en borrador de tu equipo...';
      case 6:
        return 'Aún no tienes licencias';
    }

    return 'Aún no tienes licencias';
  }

  private fixTabIndex() {
    if (!this.isApprover()) return;
    const tabGroup = this.tabGroup();
    if (tabGroup) {
      this.selectedTabIndex.set(tabGroup.selectedIndex);
    } else {
      setTimeout(() => this.fixTabIndex(), 1000);
    }
  }

  private setSelectTab(index: number) {
    const tabGroup = this.tabGroup();
    if (tabGroup) {
      tabGroup.selectedIndex = index;
      this.selectedTabIndex.set(index);
    }
  }
}
