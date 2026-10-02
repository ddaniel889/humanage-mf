import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatNativeDateModule, MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { EmployeeLeaveService } from '@shared/services/employee-leave-requests.service';
import { ConfigLeaveEmployee } from '@shared/models/Employee/config-leave-employee.model';
import { AdditionalDays } from '@shared/models/Employee/additional-type.model';
import { MessageService } from '@shared/errorHandler/message.service';
import { LeaveTimeLine } from '@shared/models/times-lines.model';
import { LeaveService } from '@shared/services/leave.service';
import { getKey, LeaveRules } from '@shared/models/leave-rules.model';
import { MinLeaveRequestData } from '@shared/models/Employee/min-leave-request';
import { Holiday } from '@shared/models/calendar-holidays';
import { LeaveHolidayFind } from '@shared/models/leave-request-find.model';
import { LeaveTypeGroupResponse, LeaveTypeOu } from '@shared/models/Employee/leave-type-ou.model';
import { LeaveRequestsFrom } from '@shared/models/Employee/leave-requests-from.model';
import { SelectionButtonItem, SelectionButtonListComponent } from '@shared/components/selection-button-list/selection-button-list.component';
import { A11yModule } from "@angular/cdk/a11y";
import { COLOR_CLASSES } from '@shared/types/color.types';
import { getLeaveTypeIcon } from '@shared/models/Employee/leave-type.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-leave-dialog',
  templateUrl: './add-leave-dialog.component.html',
  styleUrls: ['./add-leave-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatStepperModule,
    MatRadioModule,
    MatOptionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatNativeDateModule,
    SelectionButtonListComponent,
    A11yModule,
],
  providers: [EmployeeLeaveService, LeaveService],
})
export class AddLeaveDialogComponent implements OnInit {
  readonly data = inject<MinLeaveRequestData & { configLeaveEmployee: ConfigLeaveEmployee[] }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<AddLeaveDialogComponent>>(MatDialogRef);
  private readonly _formBuilder = inject(UntypedFormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly employeeLeaveService = inject(EmployeeLeaveService);
  private readonly leaveService = inject(LeaveService);
  private readonly cdr = inject(ChangeDetectorRef);

  menuFormLeave = this._formBuilder.group({
    selectedMenuLeave: [null, Validators.required],
  });

  durationFormLeave = this._formBuilder.group({
    StartDate: [''],
    EndDate: [{ value: '', disabled: true }],
    DaysConsumed: ['', [Validators.required, Validators.min(1)]],
  });

  daysFormLeave = this._formBuilder.group({
    DaysConsumed: ['', Validators.required],
  });

  leaveTypeOptions: SelectionButtonItem[] = [];

  licenseSelected = signal<LeaveTypeGroupResponse | null>(null);


  readonly startDate = new FormControl<Date | null>(null);
  readonly endDateDisplay = new FormControl<Date | null>({ value: null, disabled: true });
  readonly daysControl = new FormControl<number | null>(null, [Validators.required, Validators.min(1)]);

  dateFilter = (d: Date | null): boolean => this.FilterEfectiveTimes(d);

  private readonly stepper = viewChild<MatStepper>('stepper');

  iconClasses = computed(() => COLOR_CLASSES['green']);
  iconTipe = computed(() => 'fa-check');

  isLoading = false;
  summaryFormLeave: UntypedFormGroup;
  summarySettlementFormLeave: UntypedFormGroup;
  selectedDays: UntypedFormControl;
  DaysConsumed: UntypedFormControl;
  StartDate: UntypedFormControl;
  EndDate: UntypedFormControl;
  selectedMenuLeave: string;
  leaveRequestsData: LeaveRequestsFrom;
  configLeaveEmployees: ConfigLeaveEmployee[];
  leaveTypeOu: LeaveTypeOu[];
  fechaInicio: Date;
  fechaFin: Date;
  fechaRegreso: Date;
  daysRequestsNow: number;
  previousStep: number;
  leaveRequests: unknown;
  durationSave: unknown;
  daysRequests: unknown;
  employeeLeaveRequests: unknown;
  savedLeaveId: string | null = null;
  private leaveTypesByGroup: LeaveTypeGroupResponse[] = [];
  diasConsumidos: number;
  OrganizationalUnitId = 0;
  //mock para borrar
  AvailableDays = 0;
  AvailableDebth = 0;
  MinDate: Date;
  MaxDate: Date;
  timeslines: LeaveTimeLine[] = [];
  allTimeslines: LeaveTimeLine[] = [];
  holidays: Holiday[] = [];
  arrId:number[] = [];
  error= "";
  daysNoAble: number[];
  rules: LeaveRules;
  fechaIni:Date;

  licenseIcon = computed(() => getLeaveTypeIcon(this.licenseSelected()?.leaveTypeId));

  async ngOnInit() {
    this.daysNoAble = [0,1,2,3,4,5,6];
    this.isLoading = true;

    this.configLeaveEmployees = this.data.configLeaveEmployee;
    if (this.configLeaveEmployees == null || this.configLeaveEmployees.length == 0) {
      this.messageService.showInfo("El empleado no posee configuración de vacaciones");
      this.dialogRef.close();
    }
    await this.getLeaveConfigurations();
    this.buildLeaveTypeOptions();
    this.AvailableDays = 0;
    this.AvailableDebth = 0;
    const today = new Date();
    const configLeaveChecked = new Map<string, boolean>();
    for (const configLeaveEmployee of this.configLeaveEmployees) {
      if (configLeaveEmployee.configLeaveOu.enabled){
        configLeaveEmployee.configTimeLines.forEach(x => {
          x.dateTo = this.formatDateToDDMMYYYY(x.dateTo);
          const [dayTo, monthTo, yearTo] = x.dateTo.split('/');
          const toDate = new Date(+yearTo, +monthTo - 1, +dayTo);
          if(today < toDate){
            if(!configLeaveChecked.has(x.configLeaveOuId)){
              this.AvailableDays += configLeaveEmployee.baseDays + this.getDaysAdditional(configLeaveEmployee.additionalDays) - configLeaveEmployee.daysConsumed;
              configLeaveChecked.set(x.configLeaveOuId, true);
            }
            x.dateFrom = this.formatDateToDDMMYYYY(x.dateFrom);
            this.timeslines.push(x);
          }
          this.allTimeslines.push(x);
        })
      }
    }

   this.cargarHolidays();

    this.AvailableDebth = this.AvailableDays;
    this.daysControl.setValidators([Validators.required, Validators.min(1), Validators.max(this.AvailableDays)]);
    this.daysControl.updateValueAndValidity();
    this.arrId = this.mapConfigAproversIds(this.arrId, this.configLeaveEmployees[0])
    this.calendarToValidate(this.configLeaveEmployees[0].configLeaveOu.renewalMonthKey);
    const leaveTypeOuId = this.leaveTypeOu?.length > 0 ? this.leaveTypeOu[0].id : 0;
    this.leaveService.getWorkDays(leaveTypeOuId).toPromise().then(res =>{
      if (res.workDays == null) {
        console.log("No se encontró días laborales de la Unidad Organizacional.");
      }

      if(res.workDays !== null)
        {
          res.workDays.forEach(w =>{
            switch (w) {
              case workdays.MONDAY: this.removeday(1);
                break;
                case workdays.TUESDAY: this.removeday(2);
                break;
                case workdays.WEDNESDAY:  this.removeday(3);
                break;
                case workdays.THURSDAY: this.removeday(4);
                break;
                case workdays.FRIDAY: this.removeday(5);
                break;
                case workdays.SATURDAY: this.removeday(6);
                break;
                case workdays.SUNDAY: this.removeday(0);
                break;
              default:
                break;
            }
          });
        }
        localStorage.setItem('daysNoAble', JSON.stringify(this.daysNoAble));
        this.cdr.markForCheck();
    });

    this.leaveService.getLeaveRule(leaveTypeOuId).toPromise().then(rules =>{
      this.rules = rules;
      if (rules.id == 0) {
        console.log("No se encontró la reglas de la Unidad Organizacional.");
      }
      localStorage.setItem('rules', JSON.stringify(rules));
      localStorage.setItem('daystart', JSON.stringify(getKey(rules.leaveStartDay)));
      this.cdr.markForCheck();
    });

    localStorage.setItem('configLeavetimeslines', JSON.stringify(this.timeslines));
    localStorage.setItem('DayOfWeekAble', JSON.stringify(false));
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  async cargarHolidays(){
    try {
      await this.obtenerHolidays(this.configLeaveEmployees);
    } catch (err) {
      this.messageService.showError(err);
    }
  }

  obtenerHolidays(configLeaveEmployees: ConfigLeaveEmployee[]): Promise<void> {
    const param: LeaveHolidayFind = {
      ouId: configLeaveEmployees[0].configLeaveOu.organizationalUnitId,
      page: 1,
      itemperpage: null,
      active: true,
      type: null,
      textSearch: null
    };
    return new Promise<void>((resolve, reject) => {
      this.leaveService.postHolidaysByOuId(param).subscribe({
        next: (resp) => {
          this.holidays = resp?.values ?? [];
          localStorage.setItem('holydays', JSON.stringify(this.holidays));
          resolve();
        },
        error: (err) => {
          reject(err instanceof Error ? err : new Error(err?.message ?? String(err)));
        }
      });
    });
  }

  validateRequestsDays() {
    const { StartDate, EndDate, DaysConsumed } = this.durationFormLeave.value;
    return (StartDate === "" || EndDate === "" || DaysConsumed === "");
  }

  getDaysAdditional(additionalDays: AdditionalDays[]): number {
    let totalDays = 0;

    for (const day of additionalDays) {
      totalDays += day.days;
    }
    return totalDays;
  }

  goToSummaryVacation() {
    const validateRequestsDays = this.validateRequestsDays();
    if (!validateRequestsDays) {
      this.saveFormData();
     // this.getDaysRequests();
      if (this.daysRequestsNow > 0) {
        if (this.daysRequestsNow <= this.AvailableDays) {
          this.stepper()?.next();
        }
        else {
          this.messageService.showInfo('No puedes solicitar mas de ' + this.AvailableDays + ' día(s)');
        }
      }
      else if (this.daysRequestsNow < 0) {
        this.messageService.showInfo('La fecha de inicio debe ser anterior a la de fin');
      }
      else {
        this.messageService.showInfo('Las fechas no pueden ser iguales');
      }
    }
    else if(this.rules && this.AvailableDays > this.rules.leaveMinDays && this.durationFormLeave.controls['DaysConsumed'].value < this.rules.leaveMinDays)
    {
      this.messageService.showInfo(`Por favor, los dÍas mÍnimos a solicitar son ${this.rules.leaveMinDays}`);
    }
    else{
    this.messageService.showInfo('Por favor, ingresa la duración de la solicitud');
    }
  }

  goToSummarySettlement() {
    this.saveFormData();
    const { DaysConsumed } = this.daysFormLeave.value;
    if (DaysConsumed > 0 && DaysConsumed !== undefined && DaysConsumed !== "") {
      if (DaysConsumed <= this.AvailableDebth) {
        this.stepper()?.next();
      }
      else {
        this.messageService.showInfo('No puedes solicitar mas de ' + this.AvailableDebth + ' día(s)');
      }
    }

    else {
      this.messageService.showInfo('Tenés que solicitar al menos 1 día a procesar');
    }
    this.durationFormLeave.controls['StartDate'].markAsUntouched();
    this.durationFormLeave.controls['EndDate'].markAsUntouched();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getDaysRequests() {
    this.calcularDiferenciaEnDias(this.leaveRequestsData.StartDate, this.leaveRequestsData.EndDate);
  }

  calcularDiferenciaEnDias(startDate: Date, endDate: Date) {
    const fechaInicio = new Date(startDate);
    const fechaFin = new Date(endDate);
    const diferenciaEnMilisegundos = fechaFin.getTime() - fechaInicio.getTime();
    this.daysRequestsNow = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60 * 24));
  }

  saveFormData() {
    const { StartDate, EndDate, DaysConsumed } = this.durationFormLeave.getRawValue();
    this.leaveRequestsData = this.buildLeaveRequestData(StartDate,EndDate,DaysConsumed);
    this.diasConsumidos = DaysConsumed;
    this.fechaInicio = StartDate;
    this.fechaFin = EndDate;
    this.fechaRegreso = EndDate ? this.getNextWorkingDay(new Date(EndDate)) : null;
  }

  buildLeaveRequestData(StartDate:any, EndDate:any,DaysConsumed:number) {
    const leaveTypeOuId = this.licenseSelected()?.leaveTypeOuId ?? 0;
    if (leaveTypeOuId === 0) {
      // revisar mensaje de error
      this.messageService.showInfo('Licencia seleccionada no válida');
      throw new Error('Tipo de licencia no seleccionado');
    }

    if(this.data.userId == undefined)
      {
        const leaveRequestsData :LeaveRequestsFrom = {
          StartDate: StartDate,
          EndDate: EndDate,
          DaysConsumed: Number(DaysConsumed),
          ConfigTimesLinesId: this.allTimeslines.map(x=> x.id),
          ConfigAproversId: this.arrId,
          leaveTypeOuId: this.licenseSelected().leaveTypeOuId
        };
        return leaveRequestsData;
      }
      else
      {
        const leaveRequestsData: LeaveRequestsFrom = {
          StartDate: StartDate,
          EndDate: EndDate,
          DaysConsumed: Number(DaysConsumed),
          ConfigTimesLinesId: this.allTimeslines.map(x=> x.id),
          ConfigAproversId: this.arrId,
          userId: this.data.userId,
          userEmail:this.data.userEmail,
          userIdFiscal: this.data.userIdFiscal,
          firstName: this.data.firstName,
          lastName:this.data.lastName,
          nroLegajo:this.data.nroLegajo,
          leaveTypeOuId: this.licenseSelected().leaveTypeOuId
        };
        return leaveRequestsData;
      }
  }

  sendFormData() {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.employeeLeaveService.save(this.leaveRequestsData).toPromise()
      .then(leave => {
        this.isLoading = false;
        this.cdr.markForCheck();
        this.savedLeaveId = leave[0]?.id ?? null;
        this.stepper()?.next();
        if(leave.length > 1)
        {
          this.messageService.showInfo('La solicitud ha sido creada exitosamente. Se generó una solicitud por cada año vacacional involucrado.');
        }
        else
        {
          this.messageService.showInfo('La solicitud ha sido creada exitosamente.');
        }
      })
      .catch(error => {
        this.isLoading = false;
        this.cdr.markForCheck();
        this.messageService.showError(error);
        this.closeDialog();
      });
  }

  calendarToValidate(renewalMonthKey: number) {
    const date = new Date();
    if (date.getMonth() < renewalMonthKey) {
      // año en curso
      this.MinDate = new Date(date.getFullYear() - 1, renewalMonthKey - 1, 1);
      this.MaxDate = new Date(date.getFullYear(), 0, 1)

      this.MaxDate.setMonth(this.MaxDate.getMonth() + (renewalMonthKey - 1))
      this.MaxDate.setDate(this.MaxDate.getDate() - 1);

    }
    else {
      // próximo año
      this.MinDate = new Date(date.getFullYear(), renewalMonthKey - 1, 1);
      this.MaxDate = new Date(date.getFullYear() + 1, 0, 1)

      this.MaxDate.setMonth(this.MaxDate.getMonth() + (renewalMonthKey - 1));
      this.MaxDate.setDate(this.MaxDate.getDate() - 1);

    }
  }

  setEndDate() {

  const { StartDate, DaysConsumed } = this.durationFormLeave.value;
    if (DaysConsumed > 0 && StartDate && StartDate != "")
    {
      this.fechaIni = new Date(StartDate);
      this.durationFormLeave.patchValue({
        EndDate: this.getEndDate(this.fechaIni, DaysConsumed)
      });
    }
  }

  private getEndDate(fecha: Date, DaysConsumed: number): Date {
    if (!fecha || isNaN(fecha.getTime()) || !DaysConsumed || isNaN(DaysConsumed) || !this.rules) {
      return null;
    }
    if(this.rules.useConsecutiveDays){
        return new Date(fecha.getFullYear(),fecha.getMonth(),(fecha.getDate()+DaysConsumed)-1)
    }
    else{
      const endDate = this.calculateEndDateExcludingDays(fecha, DaysConsumed, this.daysNoAble, this.holidays);
      return endDate
    }

  }

  private calculateEndDateExcludingDays(startDate: Date, daysToConsume: number, daysNoAble: number[], holidays: Holiday[]): Date {
    let daysAdded = 0;
    const currentDate = new Date(startDate);

    while (daysAdded < daysToConsume) {
      const dayOfWeek = currentDate.getDay();

      if (!daysNoAble.includes(dayOfWeek) && !(holidays.find(x => x.state && new Date(x.effectiveHolidayDate).toISOString() == currentDate.toISOString()))) {
        daysAdded++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
    currentDate.setDate(currentDate.getDate() - 1);

    return currentDate;
  }

  FilterEfectiveTimes(d: Date): boolean {
    if(d == undefined || d == null) {
      return false;
    }

    const filterDate = new Date(d);
    const holidays = JSON.parse(localStorage.getItem('holydays'));
    const rules = JSON.parse(localStorage.getItem('rules'));
    const daysNoAble = JSON.parse(localStorage.getItem('daysNoAble'));
    let daystart = JSON.parse( localStorage.getItem('daystart')) == undefined ? getKey(rules.leaveStartDay) : JSON.parse( localStorage.getItem('daystart'));
    let dayOfWeekAble = JSON.parse( localStorage.getItem('DayOfWeekAble')) ?? false;
    dayOfWeekAble = filterDate.getDate() == 1 ? false : JSON.parse( localStorage.getItem('DayOfWeekAble'));
    if(filterDate.getDate() == 1) {
      localStorage.setItem('DayOfWeekAble', JSON.stringify(false));
    }

    if(rules == undefined || rules == null || rules.id == 0) {
      let result = false;
      const timeslines = JSON.parse(localStorage.getItem('configLeavetimeslines'));
      timeslines.forEach(t=>{
        const fechaInicio: Date=new Date(Number.parseInt(t.dateFrom.split('/')[2]),Number.parseInt(t.dateFrom.split('/')[1]) - 1,Number.parseInt(t.dateFrom.split('/')[0]));
        const fechaFin: Date=new Date(Number.parseInt(t.dateTo.split('/')[2]),Number.parseInt(t.dateTo.split('/')[1]) - 1,Number.parseInt(t.dateTo.split('/')[0]));
        if( fechaInicio<= filterDate && fechaFin >= filterDate) {
          result = true;
        }
      });

      return result;
    } else if (getKey(rules.leaveStartDay) != -1 && !rules.nextAbleDay) {
      let result = false;
      const timeslines = JSON.parse(localStorage.getItem('configLeavetimeslines'));
      timeslines.forEach(t=>{
      const fechaInicio: Date=new Date(Number.parseInt(t.dateFrom.split('/')[2]),Number.parseInt(t.dateFrom.split('/')[1]) - 1,Number.parseInt(t.dateFrom.split('/')[0]));
      const fechaFin: Date=new Date(Number.parseInt(t.dateTo.split('/')[2]),Number.parseInt(t.dateTo.split('/')[1]) - 1,Number.parseInt(t.dateTo.split('/')[0]));
      if( fechaInicio<= filterDate && fechaFin >= filterDate && daysNoAble != null && daysNoAble.find(x => x == filterDate.getDay()) == undefined && holidays.find(x => x.state && new Date(x.effectiveHolidayDate).toISOString() == filterDate.toISOString()) == undefined) {
        if(filterDate.getDay() == daystart)
        {
          result = true;
        }
      }
      });

        return result;
    } else if(getKey(rules.leaveStartDay) == -1) {
      let result = false;
      const timeslines = JSON.parse(localStorage.getItem('configLeavetimeslines'));
      timeslines.forEach(t=>{
        const fechaInicio: Date=new Date(Number.parseInt(t.dateFrom.split('/')[2]),Number.parseInt(t.dateFrom.split('/')[1]) - 1,Number.parseInt(t.dateFrom.split('/')[0]));
        const fechaFin: Date=new Date(Number.parseInt(t.dateTo.split('/')[2]),Number.parseInt(t.dateTo.split('/')[1]) - 1,Number.parseInt(t.dateTo.split('/')[0]));
        if( fechaInicio<= filterDate && fechaFin >= filterDate && daysNoAble != null && daysNoAble.find(x => x == filterDate.getDay()) == undefined && holidays.find(x => x.state && new Date(x.effectiveHolidayDate).toISOString() == filterDate.toISOString()) == undefined) {
          result = true;
        }
      });

      return result;
    } else {
      let result = false;
      const timeslines = JSON.parse(localStorage.getItem('configLeavetimeslines'));
      if (rules && holidays && daysNoAble && timeslines) {
        timeslines.forEach(t=>{
        const fechaInicio: Date=new Date(Number.parseInt(t.dateFrom.split('/')[2]),Number.parseInt(t.dateFrom.split('/')[1]) - 1,Number.parseInt(t.dateFrom.split('/')[0]));
        const fechaFin: Date=new Date(Number.parseInt(t.dateTo.split('/')[2]),Number.parseInt(t.dateTo.split('/')[1]) - 1,Number.parseInt(t.dateTo.split('/')[0]));

        if( fechaInicio <= filterDate && fechaFin >= filterDate) {
          if(daysNoAble != null && daysNoAble.find(x => x == filterDate.getDay()) == undefined && holidays.find(x => x.state && new Date(x.effectiveHolidayDate).toISOString() == filterDate.toISOString()) == undefined)
          {
            if(filterDate.getDay() == daystart)
            {
              result = true;
              daystart = getKey(rules.leaveStartDay);
              localStorage.setItem('daystart', JSON.stringify(daystart));
              localStorage.setItem('DayOfWeekAble', JSON.stringify(false));
            }
          } else {
            // preguntar si el dia anterior es feriado
            result = false;
            if(dayOfWeekAble){
            daystart = daystart <= filterDate.getDay() ? (filterDate.getDay() < 6 ? filterDate.getDay() + 1 : 0):daystart;
            localStorage.setItem('daystart', JSON.stringify(daystart));
            }
          }
          // si es domingo habilito para seleccionar el día de inicio de las solicitudes
          if(filterDate.getDay() == 0) {
            localStorage.setItem('DayOfWeekAble', JSON.stringify(true));
          }
        }
      });

      return result;
    }
    else{
      return true;
    }
  }
}

buildLeaveRequestParam(configLeave: ConfigLeaveEmployee[])
{
  const param = {
          userId:configLeave[0].userId.toString(),
          organizationalUnitId:configLeave[0].configLeaveOu.organizationalUnitId,
          page: 0,
          itemPerPage: 1200,
          isPaged: true
        };

        return param;

}

mapConfigTimeLinesIds(arrId: number[],configLeave: ConfigLeaveEmployee[])
{
    configLeave.forEach(c => {
      c.configEmployeesTimeLines.forEach(e => {
        if(e.enabled)
        {
          arrId.push(e.configTimeLineId);
        }
    })
  })
    return arrId;
}


mapConfigAproversIds(arrId: number[], configLeave: ConfigLeaveEmployee) {
  const uniqueApproverIds = new Set<number>(arrId);

  configLeave.configEmployeeApprovers.forEach(e => {
    if (e.enabled) {
      uniqueApproverIds.add(e.configAproversId);
    }
  });

  return Array.from(uniqueApproverIds);
}

focusOutFunction(event: any)
{
  if(this.durationFormLeave.controls['DaysConsumed'].errors == null)
  {
    if (Number.parseInt(event.value) > this.AvailableDays)
    {
        event.value='';
        this.messageService.showInfo('No puedes solicitar mas de ' + this.AvailableDays + ' día(s)');
    }
    else
    {
      this.daysRequestsNow = Number.parseInt(event.value);
      const { StartDate, DaysConsumed } = this.durationFormLeave.value;
      if(StartDate !== "")
        this.durationFormLeave.patchValue({
          EndDate: new Date(StartDate.getFullYear(),StartDate.getMonth(),(StartDate.getDate()+DaysConsumed)-1)
        });
    }
  }
  else
  {
    this.durationFormLeave.patchValue({
      EndDate: ''
    });
  }
}
validateInteger()
{
  if(this.durationFormLeave.controls['DaysConsumed'].errors != null)
  {
  this.error = "Campo Inválido";
  }
  else if(this.rules.leaveMinDays && this.AvailableDays > this.rules.leaveMinDays && this.durationFormLeave.controls['DaysConsumed'].value < this.rules.leaveMinDays)
  {
    this.error = `Los días mínimos que debe seleccionar son ${this.rules.leaveMinDays}`;
    this.durationFormLeave.controls['DaysConsumed'].setErrors({'error': true});
  }
  else if(this.durationFormLeave.controls['DaysConsumed'].value > this.AvailableDays)
  {
    this.error = `No puede seleccionar más de  ${this.AvailableDays}`;
    this.durationFormLeave.controls['DaysConsumed'].setErrors({'error': true});
  }
  else
  {
    this.error ="";
  }
  }
  getMinLeaveRequestFromStorage(): any {
    const leaveRequestData = localStorage.getItem("minLeaveRequest");

    if (leaveRequestData) {
      try {
        return JSON.parse(leaveRequestData);
      } catch (err) {
        console.error('Error al parsear el objeto de localStorage', err);
        return null;
      }
    } else {
      console.warn('No se encontró el objeto "minLeaveRequest" en localStorage');
      return null;
    }
  }
  removeday(day: number)
  {
    this.daysNoAble = this.daysNoAble.filter(x => x != day);
  }

  async getLeaveConfigurations(): Promise<void> {
    const ouId = this.configLeaveEmployees?.[0]?.configLeaveOu?.organizationalUnitId;
    if (!ouId) {
      return;
    }
    try {
      this.leaveTypeOu = await firstValueFrom(this.leaveService.getLeaveTypesByOu(ouId));
      localStorage.setItem('leaveTypesByOu', JSON.stringify(this.leaveTypeOu ?? []));

      const configLeave = this.configLeaveEmployees[0];
      const groupId =
        configLeave.configLeaveOu.leaveTypeOu?.leaveGroupOu?.id ??
        this.leaveTypeOu?.find((lt) => lt.leaveType.id === configLeave.leaveType?.id)?.leaveGroupOu?.id;

      if (groupId != null) {
        this.leaveTypesByGroup = await firstValueFrom(this.leaveService.getLeaveTypesByGroup(ouId, groupId)) ?? [];
      }
    } catch (err) {
      this.messageService.showError(err);
    }
  }

  private buildLeaveTypeOptions(): void {
    const FALLBACK: SelectionButtonItem[] = [{ value: 'AddVacation', label: 'Vacaciones' }];

    if (this.leaveTypesByGroup.length) {
      this.leaveTypeOptions = this.leaveTypesByGroup.map((lt) => ({
        value: String(lt.leaveTypeId),
        label: lt.description,
      }));
      return;
    }

    this.leaveTypeOptions = FALLBACK;
  }

  getStartLeaveDay(day: string): number
  {
    switch (day) {
      case workdays.MONDAY: return 1;
        case workdays.TUESDAY: return 2;
        case workdays.WEDNESDAY: return 3;
        case workdays.THURSDAY: return 4;
        case workdays.FRIDAY: return 5;
        case workdays.SATURDAY: return 6;
        case workdays.SUNDAY: return 0;
      default:
        return -1;
    }
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onViewRequestClick(): void {
    this.dialogRef.close({ leaveId: this.savedLeaveId });
  }

  onLeaveTypeSelected(id: string | number): void {
    this.menuFormLeave.controls['selectedMenuLeave'].setValue(id);
    const found = this.leaveTypesByGroup.find(lt => String(lt.leaveTypeId) === String(id));
    this.licenseSelected.set(found ?? null);
  }

  onStartDateChange(): void {
    this.recalculateEndDate();
  }

  onDaysInputChange(): void {
    const days = this.daysControl.value;
    this.daysRequestsNow = days ? Number(days) : null;
    this.recalculateEndDate();
  }

  private recalculateEndDate(): void {
    const startDate = this.startDate.value;
    const days = this.daysControl.value;

    if (!startDate || !days || days < 1) {
      this.endDateDisplay.setValue(null);
      return;
    }

    const numDays = Number(days);
    const endDate = this.getEndDate(new Date(startDate), numDays);
    this.endDateDisplay.setValue(endDate);

    this.daysRequestsNow = numDays;
    this.fechaRegreso = endDate ? this.getNextWorkingDay(new Date(endDate)) : null;
    this.durationFormLeave.patchValue({
      StartDate: startDate,
      EndDate: endDate,
      DaysConsumed: numDays,
    });
    this.cdr.markForCheck();
  }


  private getNextWorkingDay(date: Date): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    while (
      this.daysNoAble.includes(next.getDay()) ||
      this.holidays.some(h => h.state && new Date(h.effectiveHolidayDate).toISOString() === next.toISOString())
    ) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  private formatDateToDDMMYYYY(dateString: string): string {
    const date = this.parseDate(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private parseDate(dateStr: string): Date {
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      // Formato yyyy-mm-dd
      return new Date(dateStr);
    } else {
      // Formato dd/mm/yyyy
      const [day, month, year] = dateStr.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
  }
}

export enum workdays {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY= "SUNDAY"
}
