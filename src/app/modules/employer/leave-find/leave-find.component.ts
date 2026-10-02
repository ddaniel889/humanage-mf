/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
  inject,
  signal,
  computed,
} from '@angular/core';
import { MAT_MENU_DEFAULT_OPTIONS, MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe, NgClass, NgFor } from '@angular/common';

import {
  ContainerType,
  Employee,
  LeaveFindFilters,
  OrganizationalUnit,
  LeaveRequest,
  LeaveRequestFind,
} from '../../shared/models';
import { KeyValuePair } from '../../shared/models/Generics/ikeyValuePair.model';
import { MessageType } from '../../shared/models/message-types.model';
import { LeaveStateFind } from '../../shared/models/Employee/leave-state.model';
import { FileDocumentCollaborationData } from '../../shared/models/file-document-sign-data.model';
import { LeaveApprovers } from '../../shared/models/approvers.model';
import {LeaveTypeOuSummary, WorkflowApproveType} from '../../shared/models/Employee/leave-type-ou.model';
import { EmployeeFind } from '../../shared/models/Employee';
import { EmployeeFileDocumentDialogData } from '../../shared/models/employee-file-document-dialog-data.model';

import { GenericBottomSheetComponent } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.component';
import { LeaveRequestDetailComponent } from '../leave-request-detail/leave-request-detail.component';
import { ProgressMassiveApproveRequestsComponent } from '../progress-massive-approve-requests/progress-massive-approve-requests.component';

import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { LeaveService } from '../../shared/services/leave.service';
import { UiNotificationsService } from '../../shared/services/ui-notifications.service';
import { FileDocumentService } from '../../shared/services/file-document.service';
import { EmployeeService } from '../../shared/services/employee.service';
import { ContainerTypeService } from '../../shared/services/container-type.service';
import { FileService } from '../../shared/services/file.service';
import { AuthService } from '../../../core/auth/auth.service';
import { HostEventsService } from '../../../core/host-events';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { firstValueFrom } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgxMaskPipe } from 'ngx-mask';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OuSelectComponent } from '../../shared/components/ou-select/ou-select.component';
import { AutocompleteChipComponent } from '../../shared/autocomplete-chip/autocomplete-chip.component';
import { CsPaginatorComponent } from '../../shared/cs-paginator/cs-paginator.component';
import { ChapaComponent } from '../../shared/chapa/chapa.component';

@Component({
  selector: 'app-leave-find',
  templateUrl: './leave-find.component.html',
  styleUrls: ['./leave-find.component.scss'],
  imports: [
    NgClass,
    NgFor,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    MatAccordion,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    OuSelectComponent,
    MatFormFieldModule,
    MatExpansionPanelTitle,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSelectModule,
    NgxMaskPipe,
    AutocompleteChipComponent,
    CsPaginatorComponent,
    ChapaComponent,
    LeaveRequestDetailComponent,
  ],
  providers: [
    {
      provide: MAT_MENU_DEFAULT_OPTIONS,
      useValue: { overlayPanelClass: 'mf-hl-tailwind-scope' },
    },
  ],
})
export class LeaveFindComponent implements OnInit {
  @ViewChild('selectState') selectState: any;
  @ViewChild('selectLeaveType') selectLeaveType: any;
  @ViewChild(LeaveRequestDetailComponent) detail: LeaveRequestDetailComponent;
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
  leaveFindFilter: LeaveFindFilters;
  organizationalUnitId: string;
  leaves: LeaveRequest[];
  orderBy: string[];
  orderAsc: boolean;
  filterName: string;
  loading = false;
  loadingDetail = false;
  pageIndex: number;
  itemsCount: number;
  searchOpened: boolean;
  organizationalUnits: OrganizationalUnit[];
  selectedOrganizationalUnit: OrganizationalUnit;
  selectedLeaveStateFind: number = LeaveStateFind.pendiente;
  selectedLeaveSearchAdvancedStateFind: number = LeaveStateFind.pendiente;
  active: boolean;
  selectedLeaveRequest: LeaveRequest;
  showDetail = signal(false);
  allSelected = false;
  showApproveLeaves = false;
  selectRequestId = undefined;
  containerType: ContainerType;
  containerTypeId: number;
  employee: Employee;
  views: KeyValuePair<string, string>[] = [{ key: 'Licencias', value: 'employer/leave-find' }];
  selectedView: KeyValuePair<string, string>;
  showResults = false;
  isLeaveEditOpened: boolean;
  leaveTypeIcon: string;
  statesFilters: KeyValuePair<number, string>[] = [
    { key: 5, value: 'Ver Todos' },
    { key: 1, value: 'Solicitudes Pendientes' },
    { key: 2, value: 'Solicitudes Aprobadas' },
    { key: 3, value: 'Solicitudes Rechazadas' },
    { key: 4, value: 'Solicitudes Canceladas' },
    { key: 0, value: 'Solicitudes Borrador' },
  ];
  leavesTypeFilters: LeaveTypeOuSummary[]
  selectedLeaveType: number = -1
  selectedLeaveSearchAdvancedTypeFind: number = -1
  idFiscalMask: string;
  fechaInicio: Date;
  fechaFin: Date;
  MaxFromStart: Date;
  MinFromStart: Date;
  MaxUntilStart: Date;
  MinUntilStart: Date;
  MinFromCreate: Date;
  MaxFromCreate: Date;
  MaxUntilCreate: Date;
  MinUntilCreate: Date;
  StartDate: UntypedFormControl;
  InitDate: UntypedFormControl;
  UntilDate: UntypedFormControl;
  EndDate: UntypedFormControl;
  filterDateFormLeave: UntypedFormGroup;
  selectApproverAccion: number = 0;
  selectStateModel: number = 1;
  currentOu: number = 0;
  workflowApproveType: WorkflowApproveType;
  placeHolder = 'Sin Seleccionar';
  approversOptions = [
    { value: 1, viewValue: 'A validar por Aprobador de Equipo' },
    { value: 2, viewValue: 'Validada por Aprobador de Equipo' },
    { value: 3, viewValue: 'Rechazada por Aprobador de Equipo' },
  ];
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  approverActionsByState: { [key: number]: any[] } = {
    5: [
      { value: 1, viewValue: 'A validar por Aprobador de Equipo' },
      { value: 2, viewValue: 'Validada por Aprobador de Equipo' },
      { value: 3, viewValue: 'Rechazada por Aprobador de Equipo' },
    ],
    1: [
      { value: 1, viewValue: 'A validar por Aprobador de Equipo' },
      { value: 2, viewValue: 'Validada por Aprobador de Equipo' },
    ],
    2: [{ value: 2, viewValue: 'Validada por Aprobador de Equipo' }],
    3: [
      { value: 2, viewValue: 'Validada por Aprobador de Equipo' },
      { value: 3, viewValue: 'Rechazada por Aprobador de Equipo' },
    ],
    4: [{ value: 2, viewValue: 'Validada por Aprobador de Equipo' }],
  };
  filterApprovers: LeaveApprovers[];
  selectedApprovers: LeaveApprovers[] = [];
  showMassiveApproveCheck: boolean;

  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly msjService = inject(MessageService);
  private readonly organizationalUnitService = inject(OrganizationalUnitService);
  private readonly router = inject(Router);
  private readonly _bottomSheet = inject(MatBottomSheet);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly leaveService = inject(LeaveService);
  private readonly _formBuilder = inject(UntypedFormBuilder);
  private readonly uiNotificationsService = inject(UiNotificationsService);
  private readonly fileDocumentService = inject(FileDocumentService);
  private readonly dialog = inject(MatDialog);
  private readonly employeeService = inject(EmployeeService);
  private readonly containerTypeService = inject(ContainerTypeService);
  private readonly messageService = inject(MessageService);
  private readonly fileService = inject(FileService);
  private readonly hostEventsService = inject(HostEventsService);

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly breakpoints = [Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium];
  breakpointSignal = toSignal(this.breakpointObserver.observe(this.breakpoints), {
    initialValue: { matches: false, breakpoints: {} }
  });
  useSmallIcon = computed(() => this.breakpointSignal().matches);

  constructor() {
    this.filterDateFormLeave = this._formBuilder.group({
      FromDateCreate: [''],
      UntilDateCreate: [''],
      FromDateStart: [''],
      UntilDateStart: [''],
      selectApproverAccion: null,
      selectState: null,
      selectLeaveType: null,
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.selectState?.panelOpen) {
      const target = event.target as HTMLElement;
      const componentRoot = document.querySelector('app-leave-find');
      if (componentRoot && !componentRoot.contains(target)) {
        this.selectState.close();
        this.onMatSelectClosed();
      }
    }
  }

  onMatSelectClosed() {
    if (this.selectState?._elementRef) {
      const el = this.selectState._elementRef.nativeElement;
      el.classList.add('invisible-item');
    }
  }

  ngOnInit() {
    this.subscribeGotoLeave();
    this.loading = true;
    this.selectedView = this.views.find((v) => v.key === 'Licencias');
    this.organizationalUnitId = localStorage.getItem('organizationId');
    try {
      const currentOuRes = this.organizationalUnitService.getCurrentOrChildOU();
      this.currentOu = currentOuRes.id;
    } catch {
      this.currentOu = Number.parseInt(this.organizationalUnitId);
    }
    this.validateWorkFlow(this.currentOu);
    this.getLeaveTypesByOu(this.currentOu);
    this.leaveFindFilter = this.localStorageService.get('leaveFindFilter');

    this.route.params.subscribe((param) => {
      this.selectRequestId = this.selectRequestId != undefined ? undefined : param['id'];
    });
    if (this.selectRequestId) {
      this.loadLeave();
    } else {
      this.initialComponent();
    }
    this.approversOptions = this.approverActionsByState[this.selectedLeaveStateFind] || [];
    this.showCheckbox();
  }

  setDateEndCreate(event: any) {
    this.filterDateFormLeave.get('UntilDateCreate')?.setValue(event.value);
  }

  getLeaveTypesByOu(ouId: number) {
    this.leaveService.getLeaveTypeOuSummary(ouId).subscribe((data) => {
      if (data?.leaveTypeOuSummaries.length > 0) {
        this.leavesTypeFilters = [
          { leaveTypeId: -1, description: 'Ver Todos', groups: [] },
          ...data.leaveTypeOuSummaries
        ];
      }
    });
  }

  validateWorkFlow(ouId: number) {
    this.leaveService.getLeaveTypesByOu(ouId).subscribe((data) => {
      if (data?.length > 0) {
        this.workflowApproveType = data[0].workflowApprove ?? null;
      }
    });
  }

  resetDateForm() {
    this.filterDateFormLeave.reset();
    this.selectedApprovers = [];
    this.getFilterApprovers(this.currentOu);
    this.selectedLeaveSearchAdvancedStateFind = LeaveStateFind.pendiente;
  }

  findButtonEnable() {
    const { UntilDate, InitDate, FromDateInit, UntilDateInit, selectApproverAccion, selectState, selectLeaveType } =
      this.filterDateFormLeave.value;
    if (this.selectedApprovers.length > 0) {
      return false;
    } else {
      return (
        (FromDateInit === null ||
          UntilDateInit === '' ||
          FromDateInit === '' ||
          UntilDateInit === null ||
          InitDate === '' ||
          UntilDate === null ||
          UntilDate === '' ||
          InitDate === null) &&
        (selectApproverAccion === 0 || selectApproverAccion === null) &&
        (selectState === 0 || selectState === null) &&
        (selectLeaveType === 0 || selectLeaveType === null)

      );
    }
  }

  closeFindAdvanced() {
    this.menuTrigger.closeMenu();
  }

getLeaveTypeIcon(leave: LeaveRequest): string {
  // Normalizamos a minúsculas o usamos el string exacto según venga de tu base de datos
  switch (leave.leaveTypeName) {
    case 'Vacaciones':
      return (leave.startDate == null || leave.endDate == null) 
        ? 'fa-money-check' 
        : 'fa-umbrella-beach';

    case 'Estudio':
      return 'fa-book';

    case 'Maternidad/paternidad':
      return 'fa-baby-carriage';

    case 'Fallecimiento':
      return 'fa-ribbon';

    case 'Matrimonio':
      return 'fa-baby-carriage';

    case 'Donar sangre':
      return 'fa-droplet'; // En algunas versiones es fa-tint con un modificador, pero droplet es el estándar actual

    case 'Mudanza':
      return 'fa-house-chimney';

    case 'Enfermedad':
      return 'fa-briefcase-medical';

    case 'Accidente':
      return 'fa-user-injured';

    case 'Exámenes pre matrimoniales':
      return 'fa-heart-pulse';

    case 'Exámenes preventivos':
      return 'fa-stethoscope';

    default:
      return 'fa-file-alt';
  }
}

/*const LEAVE_TYPE_ICON_MAP: Record<number, string> = {//
  [LeaveTypeId.VACATION]: 'fa-umbrella-beach',
  [LeaveTypeId.SICK]: 'fa-briefcase-medical',
  [LeaveTypeId.MATERNITY]: 'fa-baby-carriage',
  [LeaveTypeId.STUDY]: 'fa-book',
  [LeaveTypeId.PATERNITY]: 'fa-baby-carriage',
  [LeaveTypeId.ACCIDENT]: 'fa-user-injured',
  [LeaveTypeId.PREVENTIVE_EXAMS]: 'fa-stethoscope',
  [LeaveTypeId.FAMILY_DEATH]: 'fa-ribbon',
  [LeaveTypeId.MARRIAGE]: 'fa-ring-diamond',
  [LeaveTypeId.MOVE]: 'fa-house-chimney',
  [LeaveTypeId.BLOOD_DONATION]: 'fa-droplet',
};*/

  getLeaveTypeName(leave: LeaveRequest): string {
    switch (leave.leaveTypeName) {
      case 'Vacaciones':
        if (leave.startDate == null || leave.endDate == null) {
          return 'Vacaciones vencidas';
        }
        return 'Vacaciones';
      default:
        return 'Vacaciones';
    }
  }

  getLeaveStatusName(leave: LeaveRequest): string {
    switch (leave.stateId) {
      case '0':
        return 'Borrador';
      case '1':
        return 'Pendiente';
      case '2':
        return 'Aprobada';
      case '3':
        return 'Rechazada';
      case '4':
        return 'Cancelada';
      default:
        return '';
    }
  }

  getLeaveStatusIcon(leave: LeaveRequest): string {
    switch (leave.stateId) {
      case '0':
        return 'fa-pencil';
      case '1':
        return 'fa-hourglass-half';
      case '2':
        return 'fa-thumbs-up';
      case '3':
        return 'fa-thumbs-down';
      case '4':
        return 'fa-times-circle';
      default:
        return '';
    }
  }
  getLeaveStatusClass(leave: LeaveRequest): string {
    switch (leave.stateId) {
      case '1':
        return 'pending';
      case '2':
        return 'ok';
      case '3':
        return 'not-ok';
      case '4':
        return 'cancelled';
      default:
        return '';
    }
  }

  numberOfDays(endDate: Date, startDate: Date): number {
    if (startDate != null || startDate != undefined || endDate != null || endDate != undefined) {
      const differenceInMilliseconds = Math.abs(endDate?.getTime() - startDate?.getTime());
      // Convierte la diferencia a días
      const days: number = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));
      return days;
    }
    return 0;
  }

  canReject(leaveRequest: LeaveRequest): boolean {
    //Puedo rechazar si es estado pendiente
    if (leaveRequest.stateId == '1') {
      return true;
    }
    //Puedo rechazar si la fecha de inicio de la licencia es mayor a la de hoy , aunque ya este aprobada
    if (leaveRequest.startDate > new Date()) {
      if (leaveRequest.stateId == '2') {
        return true;
      }
    } else {
      // Si ya entro en vigencia y esta aprobada no se puede rechazar
      if (leaveRequest.stateId == '2') {
        return false;
      }
    }
    // Los demas casos (solicitudes rechazadas) no se pueden rechazar
    return false;
  }

  loadLeave() {
    const ous = this.organizationalUnitService.getTreeInMemory();
    this.organizationalUnits = ous.filter((o) => o.isRoot === false);
    if (
      this.organizationalUnitService.getCurrentOrChildOU() == null ||
      this.organizationalUnitService.getCurrentOrChildOU().isRoot
    ) {
      this.selectedOrganizationalUnit = this.organizationalUnits[0];
      this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
    } else {
      this.selectedOrganizationalUnit = this.organizationalUnitService.getCurrentOrChildOU();
    }
    const param: LeaveRequestFind = {
      id: this.selectRequestId,
      orderBy: this.orderBy,
      orderAscendent: this.orderAsc,
      page: this.pageIndex == 0 ? 1 : this.pageIndex,
      itemPerPage: 15,
      isPaged: true,
    };
    if (!this.leaveFindFilter) {
      this.leaveFindFilter = {
        leaveRequestFind: null,
        columns: [],
        exportColumns: [],
        previousOuID: null,
      };
    }

    firstValueFrom(this.leaveService.getLeaveRequests(param)).then(
      (data) => {
        this.leaves = data.values;
        this.selectedLeaveRequest = data.values.find((f) => f.id == this.selectRequestId);
        this.selectedLeaveStateFind = Number.parseInt(this.selectedLeaveRequest.stateId);
        this.itemsCount = this.leaves.length;//
        this.showDetail.set(true);
        this.loadingDetail = true;
        this.showCheckbox();
        this.loading = false;
        this.selectedOrganizationalUnit = this.organizationalUnits.find(
          (o) => o.id == this.selectedLeaveRequest.organizationalUnitId,
        );
      },
      (err) => {
        this.msjService.showError(err);
        this.loading = false;
      },
    );
    this.idFiscalMask = this.maskSplited(this.selectedOrganizationalUnit.country.fiscalIdMask);
  }

  filteredSearch() {
    this.selectedLeaveSearchAdvancedStateFind = this.selectedLeaveStateFind;
    this.selectedLeaveSearchAdvancedTypeFind = this.selectedLeaveType;
    this.pageIndex = 0;
    this.search();
    this.showResults = true;
    this.menuTrigger.closeMenu();
  }

  filteredAdvancedSearch() {
    this.selectedLeaveStateFind = this.selectedLeaveSearchAdvancedStateFind;
    this.selectedLeaveType = this.selectedLeaveSearchAdvancedTypeFind;
    this.pageIndex = 0;
    this.search();
    this.showResults = true;
    this.menuTrigger.closeMenu();
  }

  onOuChange(ou: OrganizationalUnit) {
    this.selectedOrganizationalUnit = ou;
    this.filteredSearchRefresh(ou.id);
  }

  filteredSearchRefresh(id = undefined) {
    this.resetDateForm();
    if (id != undefined) {
      this.validateWorkFlow(id);
    }
    this.resetDateForm();
    this.pageIndex = 0;
    this.search();
    this.showResults = true;
    this.menuTrigger.closeMenu();
  }

  search(refreshGridData: boolean = true) {
    this.allSelected = false;
    this.showApproveLeaves = false;
    this.loading = true;
    if (!refreshGridData) {
      return;
    }
    const previousOu = this.organizationalUnitService.getCurrentOrChildOU();
    if (this.selectedOrganizationalUnit?.id != null) {
      this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);

      if (previousOu && previousOu.id !== this.selectedOrganizationalUnit.id) {
        this.cleanFilters();
      }
    }
    this.findLeaves(this.selectedOrganizationalUnit.id);
    this.idFiscalMask = this.maskSplited(this.selectedOrganizationalUnit.country.fiscalIdMask);
  }

  private findLeaves(ouId: number) {
    const { FromDateCreate, UntilDateCreate, FromDateStart, UntilDateStart } =
      this.filterDateFormLeave.value;
    const param: LeaveRequestFind = {
      orderBy: this.orderBy,
      orderAscendent: this.orderAsc,
      page: this.pageIndex == 0 ? 1 : this.pageIndex,
      itemPerPage: 15,
      isPaged: true,
      organizationalUnitId: ouId,
      stateId:
        this.selectedLeaveStateFind != null && this.selectedLeaveStateFind != 5
          ? this.selectedLeaveStateFind.toString()
          : null,
      textSearch: this.filterName,
      fromDateCreate: FromDateCreate ?? '',
      untilDateCreate: UntilDateCreate ?? '',
      fromDateStart: FromDateStart ?? '',
      untilDateStart: UntilDateStart ?? '',
      approverAction: this.selectApproverAccion ?? null,
      approverUserdIds: this.selectedApprovers.map((s) => s.userId),
    };
    if(this.selectedLeaveType !== -1){
      param.leaveTypeId = this.selectedLeaveType;
    }
    if (!this.leaveFindFilter) {
      this.leaveFindFilter = {
        leaveRequestFind: null,
        columns: [],
        exportColumns: [],
        previousOuID: null,
      };
    }
    firstValueFrom(this.leaveService.getLeaveRequests(param)).then(
      (data) => {
        this.leaves = data.values.sort(
          (a, b) => Number.parseInt(a.stateId) - Number.parseInt(b.stateId),
        );
        this.itemsCount = data.total;
        this.selectedLeaveRequest = undefined;
        this.showDetail.set(false);
        this.showCheckbox();
        this.loading = false;
        this.pageIndex = data.page;
        this.getFilterApprovers(this.selectedOrganizationalUnit.id);
      },
      (err) => {
        this.msjService.showError(err);
        this.loading = false;
      },
    );
  }

  selectedPageChanged(a) {
    this.search();
  }

  toggleLeaveDetail() {
    this.showDetail.update((v) => !v);
    this.selectedLeaveRequest = undefined;
  }

  selectLeaveRequest(leaveRequest: LeaveRequest) {
    if (leaveRequest != null && leaveRequest != undefined) {
      this.selectedLeaveRequest = leaveRequest;
      if (this.detail != null && this.detail != undefined)
        this.detail.getLeaveRequestDetail(leaveRequest);
      this.showDetail.set(true);
      this.loadingDetail = true;
    }
  }

  closeEdit() {
    this.isLeaveEditOpened = false;
    this.detail.getLeaveRequestDetail(this.selectedLeaveRequest);
  }

  executeFunction(event: any) {
    if (this[event.method]) {
      this[event.method](event.param);
    }
  }

  changeView(view: KeyValuePair<string, string>) {
    this.router.navigate([view.value]);
  }

  private cleanFilters() {
    this.leaveFindFilter = {
      leaveRequestFind: null,
      previousOuID: this.selectedOrganizationalUnit.id, //TODO: Corroborar si se debe colocar la ouid seleccionada cuando se limpian los filtros
    };
    this.loading = false;
  }

  //formateo las fechas
  aDosDigitos(num: number) {
    return num.toString().padStart(2, '0');
  }

  formatDate(date: Date) {
    return [
      this.aDosDigitos(date.getDate()),
      this.aDosDigitos(date.getMonth() + 1),
      date.getFullYear(),
    ].join('/');
  }

  maskSplited(mask: string) {
    const masksplited = mask.split('||');
    if (masksplited.length > 1) {
      const i = masksplited.length - 1;
      return masksplited[i];
    }
    return mask;
  }

  approveReject(approve: boolean, leave: LeaveRequest) {
    const parameters: any = {};
    if (approve) {
      parameters.bodyText = 'Aprobar solicitud';
      parameters.infoText = this.getApproveInfoText(leave);
      parameters.buttonText = 'Aprobar';
    } else {
      parameters.bodyText = 'Rechazar solicitud';
      parameters.infoText = this.getRejectInfoText(leave);
      parameters.inputLabel = 'Motivo de rechazo';
      parameters.placeHolder = 'Ingresa el motivo de rechazo';
      parameters.buttonText = 'Rechazar';
    }
    parameters.type = MessageType.ApproveReject;
    parameters.approve = approve;

    const t = this._bottomSheet.open(GenericBottomSheetComponent, {
      data: parameters,
      disableClose: true,
    });
    t.afterDismissed().subscribe((response: any) => {
      if (response.response) {
        this.loading = true;
        leave.note = response.text;
        this.leaveService.approveOrRejectLeaveRequest(leave, approve).subscribe({
          next: () => {
            if (approve) this.msjService.showInfo('Se pudo aprobar la solicitud con éxito');
            else this.msjService.showInfo('Se pudo rechazar la solicitud con éxito');
            this.search();
          },
          error: (err) => {
            this.msjService.showError(err);
            this.loading = false;
          },
        });
      }
    });
  }

  private getApproveInfoText(leave: LeaveRequest) {
    const usuario = leave.userName;
    const fechaSolicitud = leave.requestDate == null ? '' : this.formatDate(leave.requestDate);
    const fechaDesde = leave.startDate == null ? '' : this.formatDate(leave.startDate);
    const fechaHasta = leave.endDate == null ? '' : this.formatDate(leave.endDate);
    if (fechaDesde == '') {
      return (
        'Estás por aprobar las Vacaciones vencidas de ' +
        usuario +
        ' solicitadas el ' +
        fechaSolicitud +
        '. Revisa los datos antes de confirmar la operación.'
      );
    } else {
      return (
        'Estás por aprobar las Vacaciones de ' +
        usuario +
        ' solicitadas desde el ' +
        fechaDesde +
        ' hasta el ' +
        fechaHasta +
        '. Revisa los datos antes de confirmar la operación.'
      );
    }
  }
  private getRejectInfoText(leave: LeaveRequest) {
    const usuario = leave.userName;
    const fechaSolicitud = leave.requestDate == null ? '' : this.formatDate(leave.requestDate);
    const fechaDesde = leave.startDate == null ? '' : this.formatDate(leave.startDate);
    const fechaHasta = leave.endDate == null ? '' : this.formatDate(leave.endDate);
    if (fechaDesde == '') {
      return (
        'Estás por rechazar las Vacaciones vencidas de ' +
        usuario +
        ' solicitadas  el ' +
        fechaSolicitud +
        '. A continuación deberás indicar el motivo del rechazo.'
      );
    } else {
      return (
        'Estás por rechazar las Vacaciones de ' +
        usuario +
        ' solicitadas desde el ' +
        fechaDesde +
        ' hasta el ' +
        fechaHasta +
        '. A continuación deberás indicar el motivo del rechazo.'
      );
    }
  }
  selectAllToogle() {
    if (this.leaves) {
      this.leaves.forEach((element) => {
        if (this.workflowApproveType?.id === 3 && element.actionApprovers.length > 0) {
          element.selected = false;
        } else if (
          this.workflowApproveType?.id === 4 &&
          !element.actionApprovers.some((a) => a.action === 2) &&
          element.actionApprovers.length > 0
        ) {
          element.selected = false;
        } else {
          element.selected = this.allSelected;
        }
      });
    }
    this.showApproveLeaves = this.leaves.some((x) => x.selected);
  }
  selectedChange() {
    this.showApproveLeaves =
      this.leaves.some((x) => x.selected) &&
      (this.authService.isLeaveManager() || this.authService.isLeaveApprov());

    const allTheSame = this.leaves.every((val, i, arr) => val.selected === arr[0].selected);
    if (allTheSame) {
      this.allSelected = this.leaves[0].selected;
    } else {
      this.allSelected = false;
    }
  }
  ApproveLeaveRequests() {
    const parameters: any = {};
    parameters.type = MessageType.ApproveReject;
    parameters.approve = true;
    parameters.bodyText = 'Aprobar solicitudes seleccionadas';
    parameters.infoText =
      'Estas por aprobar las solicitudes seleccionadas. Revise los datos antes de confirmar la operación.';
    parameters.buttonText = 'Aprobar';

    const t = this._bottomSheet.open(GenericBottomSheetComponent, {
      data: parameters,
      disableClose: true,
    });
    t.afterDismissed().subscribe((response: any) => {
      if (response.response) {
        const dialogRef = this.dialog.open(ProgressMassiveApproveRequestsComponent, {
          disableClose: true,
          panelClass: 'mf-hl-tailwind-scope',
          data: this.leaves.filter((l) => l.selected).map((m) => m.id),
        });
        dialogRef.afterClosed().subscribe(() => {
          this.allSelected = false;
          this.showApproveLeaves = false;
          this.search();
        });
      } else {
        this.search();
      }
    });
  }

  ShowMessage(success: any) {
    if (success == true) {
      this.msjService.showInfo('Se aprobaron todas las solicitudes seleccionadas éxitosamente.');
    } else {
      this.msjService.showInfo('Algunas Solicitudes seleccionadas no pudieron ser aprobadas.');
    }
  }
  hidedetailLoading() {
    this.loadingDetail = false;
  }
  initialComponent() {
    const ous = this.organizationalUnitService.getTreeInMemory();
    this.organizationalUnits = ous.filter((o) => o.isRoot === false);
    if (
      this.organizationalUnitService.getCurrentOrChildOU() == null ||
      this.organizationalUnitService.getCurrentOrChildOU().isRoot
    ) {
      this.selectedOrganizationalUnit = this.organizationalUnits[0];
      this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
    } else {
      this.selectedOrganizationalUnit = this.organizationalUnitService.getCurrentOrChildOU();
    }
    // this.orderBy =
    this.orderAsc = true;
    const param: LeaveRequestFind = this.leaveFindFilter
      ? this.leaveFindFilter.leaveRequestFind
      : null;
    if (param && this.selectedOrganizationalUnit.id == param.organizationalUnitId) {
      this.orderBy = param.orderBy;
      this.orderAsc = param.orderAscendent;
      this.pageIndex = param.page;
      param.itemPerPage = 15;
      param.isPaged = true;
      this.filterName = param.textSearch;
    }
    this.search();
    this.idFiscalMask = this.maskSplited(this.selectedOrganizationalUnit.country.fiscalIdMask);
  }
  subscribeGotoLeave() {
    this.uiNotificationsService.gotoLeave.subscribe((id) => {
      this.selectedLeaveRequest = undefined;
      this.selectRequestId = id;
      this.loadLeave();
    });
  }

  getLeaveValidationIcon(leave: LeaveRequest) {
    const actionApprovers = leave.actionApprovers.sort((a, b) => b.action - a.action)[0];
    switch (actionApprovers.action) {
      case 1:
        return 'fa-check-circle';
      case 2:
        return 'fa-check-circle';
      case 3:
        return 'fa-times-circle';
      default:
        return '';
    }
  }

  setDateEndStart(event: any) {
    this.filterDateFormLeave.get('UntilDateStart')?.setValue(event.value);
  }

  getLeaveValidationClass(leave: LeaveRequest) {
    const actionApprovers = leave.actionApprovers.sort((a, b) => b.action - a.action)[0];
    switch (actionApprovers.action) {
      case 1:
        return 'pending';
      case 2:
        return 'ok';
      case 3:
        return 'rejected';
      default:
        return '';
    }
  }

  onAccionSelected(accion) {
    this.selectApproverAccion = accion;
  }

  onStateSelected(state: number) {
    this.approversOptions = this.approverActionsByState[state] || [];
  }

  private createEmployeeFindParam(
    containerTypeId: number,
    userId: number,
    organizationUnitIds: number[],
  ): EmployeeFind {
    return {
      containerTypeId: containerTypeId,
      userid: userId,
      orderBy: ['m.factivo'],
      orderAscendent: true,
      itemPerPage: 0,
      organizationUnitIds: organizationUnitIds,
      hasLogin: null,
      active: true,
      certificateParamter: {
        withActiveCertificate: true,
        withPendingCertificate: true,
        withoutCertificate: true,
      },
      metadataParameters: [],
    };
  }

  getFilterApprovers(ouId: number) {
    this.leaveService.getApproversByOu(ouId).subscribe((res) => (this.filterApprovers = res));
  }

  viewDocument(leave: LeaveRequest) {
    firstValueFrom(this.containerTypeService.getContainerType(this.currentOu.toString(), false))
      .then((containerType) => {
        this.containerType = containerType;
        this.containerTypeId = this.containerType.id;
        const organizationUnitIds: number[] = [this.currentOu];
        const param: EmployeeFind = this.createEmployeeFindParam(
          this.containerTypeId,
          Number.parseInt(leave.userId),
          organizationUnitIds,
        );

        firstValueFrom(this.employeeService.getContainers(param))
          .then((data) => {
            this.employee = data.values[0];
            this.openDocumentLeave(leave.documentId, this.currentOu);
          })
          .catch(() => {
            this.messageService.showError('Error al obtener los contenedores del empleado');
          });
      })
      .catch(() => {
        this.messageService.showError('Error al obtener el tipo de contenedor');
      });
  }

  private openDocumentLeave(documentId: number, organizationalUnitId: number) {
    if (!this.employee) {
      this.messageService.showInfo('El empleado que tiene esta licencia no está activo');
      return;
    }
    const results = [
      firstValueFrom(
        this.fileDocumentService.getCollaboration(documentId, organizationalUnitId),
      ).catch(() => {
        this.messageService.showInfo('El documento ha sido eliminado');
      }),
      firstValueFrom(this.fileDocumentService.getSignatures(documentId)).catch(() => {
        this.messageService.showInfo('El documento ha sido eliminado');
      }),
    ];
    Promise.all(results).then(([colaborations, signatures]) => {
      firstValueFrom(this.fileDocumentService.getDocumentDetail(documentId)).then((re) => {
        const dialogData = new EmployeeFileDocumentDialogData();
        dialogData.doc = re;
        colaborations?.forEach((colaboracion) => {
          if (colaboracion.userId == null) {
            dialogData.doc.lawyerCollaborationData = this.LoadColaboracion(
              colaboracion,
              signatures,
              false,
              dialogData.doc.employeeCollaborationData,
            );
          } else {
            dialogData.doc.employeeCollaborationData = this.LoadColaboracion(
              colaboracion,
              signatures,
              true,
              dialogData.doc.employeeCollaborationData,
            );
          }
        });
        dialogData.employerSign = false;
        dialogData.signEnabled = false;
        dialogData.employee = this.employee;
        dialogData.employee.id = this.employee.id.toString();
        dialogData.showDocumentStateBottom = true;
        dialogData.showDocumentState = true;
        dialogData.showDocumentMetadata = true;
        dialogData.isNotifyDocumentVac = false;
        dialogData.isModoPDF = true;

        this.hostEventsService.openFileDocument({ data: dialogData });
      });
    });
  }

  private LoadColaboracion(
    colaboracion: any,
    documentFileSignature: any,
    employeeSignature: boolean,
    previousData?: FileDocumentCollaborationData,
  ): FileDocumentCollaborationData {
    const data = previousData || new FileDocumentCollaborationData();
    this.updateEnabledState(colaboracion, data);
    this.updateViewDate(colaboracion, data);
    this.handleAction(colaboracion, documentFileSignature, employeeSignature, data);
    return data;
  }

  private updateEnabledState(colaboracion: any, data: FileDocumentCollaborationData): void {
    data.enabled = colaboracion.action?.enabled ?? false;
  }

  private updateViewDate(colaboracion: any, data: FileDocumentCollaborationData): void {
    if (colaboracion.fechaPrimeraColaboracion != null) {
      const date = new Date(colaboracion.fechaPrimeraColaboracion);
      data.viewDate = data.viewDate && data.viewDate > date ? data.viewDate : date;
    }
  }

  private handleAction(
    colaboracion: any,
    documentFileSignature: any,
    employeeSignature: boolean,
    data: FileDocumentCollaborationData,
  ): void {
    if (colaboracion.action == null) {
      data.requiredSignature = false;
      return;
    }

    if (colaboracion.action.action !== 'UPLOAD') {
      this.handleNonUploadAction(colaboracion, documentFileSignature, employeeSignature, data);
    } else {
      this.handleUploadAction(colaboracion, data);
    }
  }

  private handleNonUploadAction(
    colaboracion: any,
    documentFileSignature: any,
    employeeSignature: boolean,
    data: FileDocumentCollaborationData,
  ): void {
    if (data.enabled) {
      data.requiredSignature = true;
    }

    if (colaboracion.action?.fechaPrimerUso != null) {
      data.signatureDate = new Date(colaboracion.action.fechaPrimerUso);
      data.signatureState = 'firmado';
      if (employeeSignature) {
        this.updateSignatureState(documentFileSignature, colaboracion.userid, data);
      }
    } else {
      if (colaboracion.action?.requiredSignature) {
        data.error = colaboracion.action.requiredSignature;
      }
      data.signatureState = 'no-firmado';
    }
  }

  private handleUploadAction(colaboracion: any, data: FileDocumentCollaborationData): void {
    data.uploaded = colaboracion.action?.fechaPrimerUso != null;
    if (colaboracion.action.fechaPrimerUso != null) {
      data.uploadDate = new Date(colaboracion.action?.fechaPrimerUso);
    }
  }

  private updateSignatureState(
    documentFileSignature: any,
    userId: string,
    data: FileDocumentCollaborationData,
  ): void {
    if (documentFileSignature != null) {
      for (const dfs of documentFileSignature) {
        if (this.isUserSignature(dfs, userId)) {
          this.updateStateForUserSignature(dfs, data);
          if (data.signatureState === 'firmado-no-conforme') {
            break;
          }
        } else if (this.isExternalSignature(dfs)) {
          this.updateStateForExternalSignature(dfs, data);
          if (data.signatureState === 'firmado-no-conforme') {
            break;
          }
        }
      }
    }
  }

  private isUserSignature(dfs: any, userId: string): boolean {
    return dfs.userid === userId;
  }

  private isExternalSignature(dfs: any): boolean {
    return dfs.isExternal && dfs.signatureResult;
  }

  private updateStateForUserSignature(dfs: any, data: FileDocumentCollaborationData): void {
    if (dfs.signatureResult === 'C' || dfs.signatureResult === 'c') {
      data.signatureState = 'firmado-conforme';
    } else {
      data.signatureState = 'firmado-no-conforme';
    }
  }

  private updateStateForExternalSignature(dfs: any, data: FileDocumentCollaborationData): void {
    if (dfs.signatureResult === 'C' || dfs.signatureResult === 'c') {
      data.signatureState = 'firmado-conforme';
    } else if (dfs.signatureResult === 'NC' || dfs.signatureResult === 'nc') {
      data.signatureState = 'firmado-no-conforme';
    }
  }

  exportAll() { // expota
    this.loading = true;
    const { FromDateCreate, UntilDateCreate, FromDateStart, UntilDateStart } =
      this.filterDateFormLeave.value;
    const params: LeaveRequestFind = {
      orderBy: this.orderBy,
      orderAscendent: this.orderAsc,
      page: this.pageIndex == 0 ? 1 : this.pageIndex,
      isPaged: false,
      organizationalUnitId: this.selectedOrganizationalUnit.id,
      stateId:
        this.selectedLeaveStateFind != null && this.selectedLeaveStateFind != 5
          ? this.selectedLeaveStateFind.toString()
          : null,
      textSearch: this.filterName,
      fromDateCreate: FromDateCreate ?? '',
      untilDateCreate: UntilDateCreate ?? '',
      fromDateStart: FromDateStart ?? '',
      untilDateStart: UntilDateStart ?? '',
      approverAction: this.selectApproverAccion ?? null,
      approverUserdIds: this.selectedApprovers.map((s) => s.userId),
    };
    if(this.selectedLeaveType !== -1){
      params.leaveTypeId = this.selectedLeaveType;
    }
    firstValueFrom(this.leaveService.exportLeaves(params)).then(
      (file) => {
        const date = new Date().toISOString();
        const filename = `Lista de solicitudes [${date}].xlsx`;
        this.fileService.download(file, filename, 'application/excel');

        this.loading = false;
      },
      () => {
        this.msjService.showError(`Fallo la exportación de las licencias.`);
        this.loading = false;
      },
    );
    this.loading = false;
  }

  removeApprover(event: any) {
    if (!this.filterApprovers.some((approver) => approver.id === event.id)) {
      this.filterApprovers.push(event);
    }
    this.selectedApprovers = this.selectedApprovers.filter((a) => a.id !== event.id);
  }
  selectApprover(approverName) {
    const filterapprover = this.filterApprovers.find((dt) => dt.name == approverName);
    if (filterapprover) {
      this.selectedApprovers.push(filterapprover);
      this.filterApprovers = this.filterApprovers.filter(
        (a) => !this.selectedApprovers.includes(a),
      );
    }
  }

  showCheckbox(): void {
    const workflowApproveTypeId = this.workflowApproveType?.id;
    switch (workflowApproveTypeId) {
      case 3:
        this.showMassiveApproveCheck = this.leaves.some((l) => l.actionApprovers.length == 0);
        break;
      case 4:
        this.showMassiveApproveCheck =
          this.leaves.some((l) => l.actionApprovers.some((ap) => ap.action === 2)) ||
          this.leaves.some((l) => l.actionApprovers.length == 0);
        break;
      default:
        this.showMassiveApproveCheck = true;
        break;
    }
  }

  isLeaveApprovedByValidator(leave: LeaveRequest): boolean {
    const workflowApproveTypeId = this.workflowApproveType?.id;
    switch (workflowApproveTypeId) {
      case 3:
        return leave.actionApprovers.length == 0;
      case 4:
        return (
          leave.actionApprovers.some((ap) => ap.action === 2) || leave.actionApprovers.length == 0
        );
      default:
        return true;
    }
  }

  shouldShowCheck(approvalFlowId: number, stateId: string, approvers: LeaveApprovers[]): boolean {
    if (approvers.length > 0 && stateId != '0') {
      switch (approvalFlowId) {
        case 1:
          // Opcional jefe y requerido RRHH
          return true;
        case 2:
          // Basado en recursos humanos
          return false;
        case 3:
          // Basado en jefe
          return false;
        case 4:
          // Requerido jefe y requerido RRHH
          return true;
        default:
          // Requerido Jefe y Recursos Humanos
          return false;
      }
    } else {
      return false;
    }
  }
}
