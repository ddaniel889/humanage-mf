import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MessageService } from '@shared/errorHandler/message.service';
import { ValidationRules } from '@shared/models';
import {
  CreateLeaveTypeOuWithRulesPayload,
  getLeaveTypeKey,
  LeaveType,
  LeaveTypeId,
  LeaveTypeOuDetailDto,
  UpdateLeaveTypeOuPayload,
} from '@shared/models/Employee';
import { AssignmentDayType } from '@shared/models/leave-rules-assignment-day-type';
import { LeaveService } from '@shared/services/leave.service';
import { GroupService } from '@shared/services/group.service';
import { CrossFieldValidators } from '@shared/validators';
import { finalize, merge, startWith, switchMap } from 'rxjs';
import {
  FeedbackDialogComponent,
  FeedbackDialogData,
} from '@shared/components/feedback-dialog/feedback-dialog.component';
import { InfoChipComponent } from '@shared/info-chip/info-chip.component';
import {
  getConsecutiveDaysKey,
  getLeaveStartDayKey,
  getWorkflowApproveKey,
  getAssignmentDayKey,
  LEAVE_START_ANY_DAY,
} from '../../utils/rules-keys.utils';
import { OrganizationalUnitService } from '@shared/services/organizational-unit.service';
import { HlFormErrorsDirective } from '@shared/directives/form-errors.directive';
import {
  SelectionButtonItem,
  SelectionButtonListComponent,
} from '@shared/components/selection-button-list/selection-button-list.component';

type DialogStep = 'selectionLeave' | 'configuration';
type MoreInformationType = 'vacation' | 'perYear' | 'perRequest' | 'noLimit';

const MORE_INFORMATION_ITEM_KEYS: Record<MoreInformationType, string[]> = {
  vacation: ['daysAssigned', 'validityPeriod', 'expiration'],
  perYear: ['automaticAssignment', 'assignmentDelay', 'futureEmployees'],
  perRequest: ['configuredDays'],
  noLimit: ['unlimitedRequests'],
};

interface FormSelectOption {
  value: boolean | number | string;
  descriptionKey: string;
}

interface DialogLeaveTypeFormControls {
  assignmentDayTypeId: FormControl<number | null>;
  quantityDays: FormControl<number | null>;
  useConsecutiveDays: FormControl<boolean>;
  leaveMinDays: FormControl<number | null>;
  leaveMaxDays: FormControl<number | null>;
  leaveStartDay: FormControl<string | null>;
  nextAbleDay: FormControl<boolean>;
  workflowApproveId: FormControl<number | null>;
}

type DialogLeaveTypeControlName = keyof DialogLeaveTypeFormControls;
type DialogLeaveTypeControlValue<K extends DialogLeaveTypeControlName> =
  Required<DialogLeaveTypeFormControls>[K] extends FormControl<infer TValue> ? TValue : never;

interface CrossFieldValidation {
  validator: ValidatorFn;
  formErrorKey: string;
  controlErrorKey: string;
  targetControl: DialogLeaveTypeControlName;
}

export interface DialogLeaveTypeFormData {
  mode: 'create' | 'edit';
  leaveTypeOu?: LeaveTypeOuDetailDto;
  preselectedLeaveType?: LeaveType;
  preselectedLeaveGroup?: {
    id: number;
    name: string;
    isActive: boolean;
  };
}

@Component({
  selector: 'hl-dialog-leave-type-form',
  templateUrl: './dialog-leave-type-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InfoChipComponent,
    SelectionButtonListComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    ReactiveFormsModule,
    TranslocoDirective,
    TranslocoPipe,
    HlFormErrorsDirective,
  ],
  providers: [LeaveService],
})
export class DialogLeaveTypeFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DialogLeaveTypeFormComponent>);
  private readonly dialog = inject(MatDialog);
  private readonly translocoService = inject(TranslocoService);
  private readonly data = inject<DialogLeaveTypeFormData>(MAT_DIALOG_DATA);
  private readonly messageService = inject(MessageService);
  private readonly leaveService = inject(LeaveService);
  private readonly groupService = inject(GroupService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly organizationalUnitService = inject(OrganizationalUnitService);

  readonly isLoading = signal(false);
  readonly isEditMode = this.data.mode === 'edit';
  private readonly isContextualCreate = (
    this.data.mode === 'create' &&
    !!this.data.preselectedLeaveType &&
    !!this.data.preselectedLeaveGroup
  );
  readonly currentStep = signal<DialogStep>(
    this.isEditMode || this.isContextualCreate ? 'configuration' : 'selectionLeave',
  );
  readonly leftActionIsBack = !this.isEditMode && !this.isContextualCreate;
  private readonly activeLang = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
    injector: this.injector,
  });

  private readonly availableLeaveTypes = signal<LeaveType[]>([]);
  readonly selectionList = computed<SelectionButtonItem[]>(() => {
    this.activeLang();

    return this.availableLeaveTypes().map((t) => ({
      value: t.id,
      label: this.translocoService.translate(getLeaveTypeKey(t.id, t.description)),
    }));
  });

  readonly leaveType = signal<LeaveType | null>(
    this.data.leaveTypeOu?.leaveType ?? this.data.preselectedLeaveType ?? null,
  );
  readonly leaveTypeNameKey = computed(() => {
    const leaveType = this.leaveType();
    return leaveType ? getLeaveTypeKey(leaveType.id, leaveType.description) : '';
  });
  readonly leaveGroupOu = signal(this.data.leaveTypeOu?.leaveGroupOu ?? this.data.preselectedLeaveGroup);

  private readonly validationRules = signal<ValidationRules | null>(null);
  private readonly configLeaveOuId = signal<number | null>(
    this.data.leaveTypeOu?.rules?.[0]?.configLeaveOuId ?? null,
  );
  private readonly currentLeaveRules = this.data.leaveTypeOu?.rules?.[0];

  readonly assignmentDayOptions = signal<FormSelectOption[]>([]);
  readonly useConsecutiveDaysOptions = signal<FormSelectOption[]>([]);
  readonly leaveStartDayOptions = signal<FormSelectOption[]>([]);
  readonly workflowApproveOptions = signal<FormSelectOption[]>([]);

  private readonly selectedAssignmentDayType = signal<number | null>(null);

  readonly showAssignmentDay = computed<boolean>(
    () => this.leaveType()?.id !== LeaveTypeId.VACATION,
  );
  readonly showQuantityDays = computed<boolean>(
    () => this.selectedAssignmentDayType() === AssignmentDayType.PER_YEAR,
  );
  readonly showUseConsecutiveDays = computed<boolean>(
    () => !!this.validationRules()?.useConsecutiveDays,
  );
  readonly showLeaveMinDays = computed<boolean>(
    () => {
      const assignmentDayType = this.selectedAssignmentDayType();
      const quantityDays = this.currentQuantityDays();

      if (this.leaveType()?.id === LeaveTypeId.VACATION) return true;
      if (assignmentDayType === AssignmentDayType.NO_LIMIT) return false;
      if (assignmentDayType === AssignmentDayType.PER_REQUEST) return true;

      return assignmentDayType === AssignmentDayType.PER_YEAR && (quantityDays ?? 0) > 1;
    },
  );
  readonly showLeaveMaxDays = computed<boolean>(
    () => {
      const assignmentDayType = this.selectedAssignmentDayType();
      const quantityDays = this.currentQuantityDays();

      if (this.leaveType()?.id === LeaveTypeId.VACATION) return false;
      if (assignmentDayType === AssignmentDayType.PER_REQUEST) return true;

      return assignmentDayType === AssignmentDayType.PER_YEAR && (quantityDays ?? 0) > 1;
    },
  );
  readonly showLeaveStartDay = computed<boolean>(
    () => !!this.validationRules()?.leaveStartDay,
  );
  readonly showNextAbleDaySection = computed<boolean>(
    () => !!this.validationRules()?.nextAbleDay,
  );
  readonly showWorkflowApprove = computed<boolean>(
    () => !!this.validationRules()?.workflowApproveId,
  );
  readonly leaveMinDaysMax = computed<number | undefined>(
    () => {
      const assignmentDayType = this.selectedAssignmentDayType();
      const quantityDays = this.currentQuantityDays();

      if (this.leaveType()?.id === LeaveTypeId.VACATION) return 31;
      if (assignmentDayType === AssignmentDayType.PER_REQUEST) return 366;
      if (assignmentDayType === AssignmentDayType.PER_YEAR && (quantityDays ?? 0) > 1) {
        return quantityDays ?? undefined;
      }

      return undefined;
    },
  );
  readonly leaveMaxDaysMax = computed<number | undefined>(() => {
    const assignmentDayType = this.selectedAssignmentDayType();
    const quantityDays = this.currentQuantityDays();

    if (assignmentDayType === AssignmentDayType.PER_REQUEST) return 366;
    if (assignmentDayType === AssignmentDayType.PER_YEAR && (quantityDays ?? 0) > 1) {
      return quantityDays ?? undefined;
    }

    return undefined;
  });

  readonly sections = computed(() => ({
    assignmentDay: this.showAssignmentDay(),
    request: (
      this.showUseConsecutiveDays() ||
      this.showLeaveMinDays() ||
      this.showLeaveMaxDays() ||
      this.showLeaveStartDay() ||
      this.showNextAbleDaySection()
    ),
    workflowApprove: this.showWorkflowApprove(),
  }));
  readonly form = this.formBuilder.group<DialogLeaveTypeFormControls>({
    assignmentDayTypeId: this.formBuilder.control<number | null>({ value: null, disabled: true }),
    quantityDays: this.formBuilder.control<number | null>({ value: null, disabled: true }),
    useConsecutiveDays: this.formBuilder.control<boolean>(
      { value: true, disabled: true },
      { nonNullable: true },
    ),
    leaveMinDays: this.formBuilder.control<number | null>({ value: null, disabled: true }),
    leaveMaxDays: this.formBuilder.control<number | null>({ value: null, disabled: true }),
    leaveStartDay: this.formBuilder.control<string | null>({ value: null, disabled: true }),
    nextAbleDay: this.formBuilder.control<boolean>(
      { value: false, disabled: true },
      { nonNullable: true },
    ),
    workflowApproveId: this.formBuilder.control<number | null>({ value: null, disabled: true }),
  });
  private readonly formValue = toSignal(this.form.valueChanges.pipe(startWith(this.form.value)), {
    injector: this.injector,
  });
  private readonly currentQuantityDays = toSignal(
    this.form.controls.quantityDays.valueChanges.pipe(startWith(this.form.controls.quantityDays.value)),
    { injector: this.injector },
  );

  readonly useConsecutiveDaysTooltip = computed<string>(() => {
    const value = this.formValue()?.useConsecutiveDays;
    if (value === true) return 'leaves.fields.useConsecutiveDays.tooltip.consecutiveDays';
    if (value === false) return 'leaves.fields.useConsecutiveDays.tooltip.businessDays';
    return '';
  });

  readonly workflowApproveTooltip = computed<string>(() => {
    const value = this.formValue()?.workflowApproveId;
    return value == null ? '' : `leaves.fields.workflowApprove.tooltip.${value}`;
  });

  readonly showNextAbleDay = computed<boolean>(() => {
    const values = this.formValue();
    const rules = this.validationRules();

    if (!rules?.nextAbleDay?.canModify) return true;
    if (!values?.leaveStartDay || values?.useConsecutiveDays === undefined) return true;

    return values.leaveStartDay !== LEAVE_START_ANY_DAY && values.useConsecutiveDays === true;
  });

  private readonly moreInformationType = computed<MoreInformationType | null>(() => {
    if (this.leaveType()?.id === LeaveTypeId.VACATION) {
      return 'vacation';
    }

    switch (this.selectedAssignmentDayType()) {
      case AssignmentDayType.PER_YEAR:
        return 'perYear';
      case AssignmentDayType.PER_REQUEST:
        return 'perRequest';
      case AssignmentDayType.NO_LIMIT:
        return 'noLimit';
      default:
        return null;
    }
  });

  readonly moreInformationItems = computed<string[]>(() => {
    const infoType = this.moreInformationType();
    if (!infoType) return [];

    return MORE_INFORMATION_ITEM_KEYS[infoType].map(
      (item) => `leaves.dialogLeaveTypeForm.moreInformation.${infoType}.${item}`,
    );
  });

  ngOnInit(): void {
    if (this.isEditMode) {
      this.loadValidationRules();
    } else if (this.isContextualCreate) {
      this.loadValidationRules();
    } else {
      this.loadAvailableLeaveTypes();
    }
  }

  onLeaveTypeSelected(id: number | string | null): void {
    const leaveType = this.availableLeaveTypes().find((t) => t.id === id);
    this.leaveType.set(leaveType ?? null);
  }

  onContinueClick(): void {
    this.loadDefaultGroupForStandardCreate();
    this.loadValidationRules();
    this.currentStep.set('configuration');
  }

  onBackClick(): void {
    this.currentStep.set('selectionLeave');

    this.selectedAssignmentDayType.set(null);
    this.validationRules.set(null);
    this.assignmentDayOptions.set([]);
    this.useConsecutiveDaysOptions.set([]);
    this.leaveStartDayOptions.set([]);
    this.workflowApproveOptions.set([]);
    this.form.clearValidators();
    this.form.reset();
    Object.values(this.form.controls).forEach((c) => c.disable({ emitEvent: false }));
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSubmitClick(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);

    if (this.isEditMode) {
      this.update();
    } else {
      this.create();
    }
  }

  private setupControlChangeWarning<K extends DialogLeaveTypeControlName>(
    controlName: K,
    warningKey: string,
    shouldWarn: (value: DialogLeaveTypeControlValue<K>) => boolean,
  ): void {
    const control = this.form.controls[controlName] as FormControl<DialogLeaveTypeControlValue<K>>;
    let confirmedValue = control.value;

    control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((newValue) => {
      if (!shouldWarn(newValue)) {
        confirmedValue = newValue;
        return;
      }

      const valueToRestore = confirmedValue;

      this.messageService
        .showConfirmation({
          title: this.translocoService.translate(`${warningKey}.title`),
          description: this.translocoService.translate(`${warningKey}.description`),
          disableClose: true,
          buttonType: 'yes-no',
        })
        .subscribe((confirmed) => {
          if (confirmed === true) {
            confirmedValue = newValue;
          } else {
            control.setValue(valueToRestore);
          }
        });
    });
  }

  private loadAvailableLeaveTypes(): void {
    this.isLoading.set(true);
    this.leaveService
      .getAvailableLeaveTypesByOu(this.organizationalUnitService.getCurrentOU().id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (types) => this.availableLeaveTypes.set(types),
        error: (err) => {
          this.dialogRef.close();
          this.messageService.showError(err);
        },
      });
  }

  private create(): void {
    const leaveType = this.leaveType();
    const configLeaveOuId = this.configLeaveOuId();
    const ouId = this.getOuId();

    if (!leaveType) {
      this.isLoading.set(false);
      this.messageService.showError(new Error('No leave type selected for creation.'));
      return;
    }

    if (configLeaveOuId == null) {
      this.isLoading.set(false);
      this.messageService.showError(
        new Error('No configLeaveOuId available for leave type creation.'),
      );
      return;
    }

    if (ouId == null) {
      this.isLoading.set(false);
      this.messageService.showError(
        new Error('No organizational unit available for leave type creation.'),
      );
      return;
    }

    const preselectedGroupId = this.leaveGroupOu()?.id;

    if (preselectedGroupId != null) {
      this.leaveService
        .createLeaveTypeOuWithRules(
          this.buildCreatePayload({
            leaveType,
            configLeaveOuId,
            organizationalUnitId: ouId,
            leaveGroupOuId: preselectedGroupId,
          }),
        )
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => this.handleSuccess(),
          error: (err) => this.messageService.showError(err),
        });
      return;
    }

    this.groupService
      .getDefaultGroupByOu(ouId)
      .pipe(
        switchMap((defaultGroup) =>
          this.leaveService.createLeaveTypeOuWithRules(
            this.buildCreatePayload({
              leaveType,
              configLeaveOuId,
              organizationalUnitId: ouId,
              leaveGroupOuId: defaultGroup.id,
            }),
          ),
        ),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.messageService.showError(err),
      });
  }

  private loadDefaultGroupForStandardCreate(): void {
    if (this.isEditMode || this.isContextualCreate || !!this.leaveGroupOu()) return;

    const ouId = this.getOuId();
    if (ouId == null) return;

    this.groupService
      .getDefaultGroupByOu(ouId)
      .subscribe({
        next: (defaultGroup) => {
          this.leaveGroupOu.set({
            id: defaultGroup.id,
            name: defaultGroup.name,
            isActive: defaultGroup.enabled,
          });
        },
        error: (err) => this.messageService.showError(err),
      });
  }

  private update(): void {
    const raw = this.form.getRawValue();
    const params: UpdateLeaveTypeOuPayload = {
      configLeaveOuId: this.currentLeaveRules?.configLeaveOuId ?? 0,
      leaveTypeOuId: this.data.leaveTypeOu.id,
      assignmentDayTypeId: raw.assignmentDayTypeId,
      quantityDays: this.showQuantityDays() ? raw.quantityDays : undefined,
      useConsecutiveDays: this.showUseConsecutiveDays() ? raw.useConsecutiveDays : undefined,
      leaveMinDays: this.showLeaveMinDays() ? raw.leaveMinDays : undefined,
      leaveMaxDays: this.showLeaveMaxDays() ? raw.leaveMaxDays : undefined,
      leaveStartDay: this.showLeaveStartDay() ? raw.leaveStartDay : undefined,
      nextAbleDay: this.showNextAbleDaySection() ? this.resolveNextAbleDay(raw.nextAbleDay) : undefined,
      workflowApproveId: this.showWorkflowApprove() ? raw.workflowApproveId : undefined,
      isDocumentRequired: false,
    };

    this.leaveService
      .updateLeaveTypeOu(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.messageService.showError(err),
      });
  }

  private handleSuccess(): void {
    this.dialogRef.close(true);

    const successMessages = this.translocoService.translateObject<Record<string, string>>(
      'leaves.dialogLeaveTypeForm.success',
    );

    const feedbackData: FeedbackDialogData = {
      icon: 'fa-check',
      color: 'green',
      title: successMessages[this.isEditMode ? 'editTitle' : 'createTitle'],
      description: successMessages['description'],
      confirmButtonText: successMessages['confirmButton'],
    };

    this.dialog.open(FeedbackDialogComponent, {
      panelClass: ['full-screen-dialog', 'mf-hl-tailwind-scope'],
      data: feedbackData,
    });
  }

  private loadValidationRules(): void {
    const leaveTypeId = this.leaveType()?.id;
    if (!leaveTypeId) return;

    const ouId = this.getOuId();
    if (ouId == undefined) return;

    this.isLoading.set(true);
    this.leaveService
      .getValidationRulesAnConfigByOuId({ leaveTypeId, ouId })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ configLeaveOu, validationRules }) => {
          this.configLeaveOuId.set(configLeaveOu.id);
          this.validationRules.set(validationRules);
          this.buildForm();
        },
        error: (err) => {
          this.dialogRef.close();
          this.messageService.showError(err);
        },
      });
  }

  private buildForm(): void {
    const validationRules = this.validationRules();

    const editValues = this.isEditMode
      ? { ...this.currentLeaveRules, workflowApproveId: this.data.leaveTypeOu?.workflowApprove?.id }
      : undefined;

    if (validationRules.useConsecutiveDays) {
      this.configureControl(
        'useConsecutiveDays',
        editValues?.useConsecutiveDays ?? validationRules.useConsecutiveDays.defaultValue,
        !validationRules.useConsecutiveDays.canModify,
      );
      this.useConsecutiveDaysOptions.set([
        { value: true, descriptionKey: getConsecutiveDaysKey(true) },
        { value: false, descriptionKey: getConsecutiveDaysKey(false) },
      ]);
    }

    if (validationRules.leaveMinDays) {
      this.configureControl(
        'leaveMinDays',
        editValues?.leaveMinDays ?? validationRules.leaveMinDays.defaultValue,
        !validationRules.leaveMinDays.canModify,
      );
    }

    if (validationRules.leaveMaxDays) {
      this.configureControl(
        'leaveMaxDays',
        editValues?.leaveMaxDays ?? validationRules.leaveMaxDays.defaultValue,
        !validationRules.leaveMaxDays.canModify,
      );
    }

    if (validationRules.leaveStartDay) {
      this.configureControl(
        'leaveStartDay',
        editValues?.leaveStartDay ?? validationRules.leaveStartDay.defaultValue,
        !validationRules.leaveStartDay.canModify,
      );
      this.leaveStartDayOptions.set(
        validationRules.leaveStartDay.options?.map((opt) => ({
          value: opt.value,
          descriptionKey: getLeaveStartDayKey(opt.value),
        })) ?? [],
      );
    }

    if (validationRules.nextAbleDay) {
      this.configureControl(
        'nextAbleDay',
        editValues?.nextAbleDay ?? validationRules.nextAbleDay.defaultValue,
        !validationRules.nextAbleDay.canModify,
      );
    }

    if (validationRules.workflowApproveId) {
      this.configureControl(
        'workflowApproveId',
        editValues?.workflowApproveId ?? validationRules.workflowApproveId.defaultValue,
        !validationRules.workflowApproveId.canModify,
      );
      this.workflowApproveOptions.set(this.sortOptionsByValue(
        validationRules.workflowApproveId.options?.map((opt) => ({
          value: opt.value,
          descriptionKey: getWorkflowApproveKey(opt.value),
        })) ?? [],
      ));
    }

    const isVacation = this.leaveType()?.id === LeaveTypeId.VACATION;
    if (isVacation && !validationRules.assignmentDay) {
      // TODO: This should come from the backend instead of being set in the frontend
      validationRules.assignmentDay = {
        defaultValue: AssignmentDayType.MANUAL_PER_YEAR,
        options: null,
        canModify: false,
      };
    }

    if (validationRules.assignmentDay) {
      this.configureControl(
        'assignmentDayTypeId',
        editValues?.assignmentDayType?.id ?? validationRules.assignmentDay.defaultValue,
        !validationRules.assignmentDay.canModify,
      );
      this.assignmentDayOptions.set(this.sortOptionsByValue(
        validationRules.assignmentDay.options?.map((opt) => ({
          value: opt.value,
          descriptionKey: getAssignmentDayKey(opt.value, opt.description),
        })) ?? [],
      ));

      if (validationRules.quantityDays) {
        this.configureControl(
          'quantityDays',
          editValues?.quantityDays ?? validationRules.quantityDays.defaultValue ?? null,
          false,
        );
      }
    }

    if (this.isEditMode) {
      this.setupControlChangeWarning(
        'useConsecutiveDays',
        'leaves.dialogLeaveTypeForm.useConsecutiveDaysWarning',
        (value) => value !== this.currentLeaveRules?.useConsecutiveDays,
      );
      this.setupControlChangeWarning(
        'workflowApproveId',
        'leaves.dialogLeaveTypeForm.workflowApproveHrWarning',
        (value) => value === 2 && this.data.leaveTypeOu?.workflowApprove?.id !== 2,
      );
    }

    this.setupQuantityDaysDependency();
    this.setupMinMaxDependency();
    this.setupCrossFieldValidations();
  }

  private setupCrossFieldValidations(): void {
    const crossFieldValidations: CrossFieldValidation[] = [
      {
        validator: (control) => {
          if (!this.showLeaveMinDays() || !this.showLeaveMaxDays()) return null;
          return CrossFieldValidators.minMax('leaveMinDays', 'leaveMaxDays')(control);
        },
        formErrorKey: 'minMax',
        controlErrorKey: 'minMax',
        targetControl: 'leaveMaxDays',
      },
      {
        validator: (control) => {
          if (!this.showLeaveMinDays() || !this.showQuantityDays()) return null;
          return CrossFieldValidators.notExceeds(
            'leaveMinDays',
            'quantityDays',
            'minExceedsQuantity',
          )(control);
        },
        formErrorKey: 'minExceedsQuantity',
        controlErrorKey: 'exceedsMax',
        targetControl: 'leaveMinDays',
      },
      {
        validator: (control) => {
          if (!this.showLeaveMaxDays() || !this.showQuantityDays()) return null;
          return CrossFieldValidators.notExceeds(
            'leaveMaxDays',
            'quantityDays',
            'maxExceedsQuantity',
          )(control);
        },
        formErrorKey: 'maxExceedsQuantity',
        controlErrorKey: 'exceedsMax',
        targetControl: 'leaveMaxDays',
      },
    ];

    this.form.setValidators(crossFieldValidations.map((v) => v.validator));
    this.form.updateValueAndValidity();

    // Sync form-level errors to specific controls for better UX
    const allControls = Object.values(this.form.controls);
    merge(...allControls.map((c) => c.valueChanges))
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.form.updateValueAndValidity({ emitEvent: false });
        const formErrors = this.form.errors;

        crossFieldValidations.forEach((config) => {
          const targetControl = this.form.controls[config.targetControl];
          const currentErrors = { ...targetControl.errors };
          delete currentErrors[config.controlErrorKey];

          const shouldAddError = formErrors?.[config.formErrorKey];

          if (shouldAddError) {
            targetControl.setErrors({
              ...currentErrors,
              [config.controlErrorKey]: formErrors[config.formErrorKey],
            });
            targetControl.markAsTouched();
          } else if (targetControl.errors?.[config.controlErrorKey]) {
            const hasOtherErrors = Object.keys(currentErrors).length > 0;
            targetControl.setErrors(hasOtherErrors ? currentErrors : null);
          }
        });
      });
  }

  private setupQuantityDaysDependency(): void {
    const assignmentDayControl = this.form.controls.assignmentDayTypeId;
    const quantityDaysControl = this.form.controls.quantityDays;

    assignmentDayControl.valueChanges
      .pipe(startWith(assignmentDayControl.value), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.selectedAssignmentDayType.set(value);
        const showQuantityDays = this.showQuantityDays();

        if (showQuantityDays) {
          const validators = [Validators.min(1), Validators.max(366), Validators.required];
          quantityDaysControl.setValidators(validators);
          quantityDaysControl.enable({ emitEvent: false });
          quantityDaysControl.updateValueAndValidity();
        } else {
          quantityDaysControl.clearValidators();
          quantityDaysControl.setValue(null, { emitEvent: false });
          quantityDaysControl.disable({ emitEvent: false });
          quantityDaysControl.updateValueAndValidity();
        }

        this.form.updateValueAndValidity({ emitEvent: false });
      });
  }

  private setupMinMaxDependency(): void {
    const assignmentDayControl = this.form.controls.assignmentDayTypeId;
    const quantityDaysControl = this.form.controls.quantityDays;

    merge(assignmentDayControl.valueChanges, quantityDaysControl.valueChanges)
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateMinMaxControls());
  }

  private updateMinMaxControls(): void {
    const leaveMinDaysControl = this.form.controls.leaveMinDays;
    const leaveMaxDaysControl = this.form.controls.leaveMaxDays;

    this.configureNumericControl(leaveMinDaysControl, this.showLeaveMinDays(), this.leaveMinDaysMax());
    this.configureNumericControl(leaveMaxDaysControl, this.showLeaveMaxDays(), this.leaveMaxDaysMax());
  }

  private configureNumericControl(
    control: FormControl<number | null>,
    visible: boolean,
    maxValue?: number,
  ): void {
    if (!visible) {
      control.clearValidators();
      control.disable({ emitEvent: false });
      control.updateValueAndValidity({ emitEvent: false });
      return;
    }

    const validators = [Validators.required, Validators.min(1)];
    if (maxValue !== undefined) {
      validators.push(Validators.max(maxValue));
    }

    control.setValidators(validators);
    if (control.disabled) {
      control.enable({ emitEvent: false });
    }
    control.updateValueAndValidity({ emitEvent: false });
  }

  private sortOptionsByValue(options: FormSelectOption[]): FormSelectOption[] {
    return [...options].sort((a, b) => {
      if (typeof a.value === 'number' && typeof b.value === 'number') {
        return a.value - b.value;
      }
      if (typeof a.value === 'boolean' && typeof b.value === 'boolean') {
        return Number(a.value) - Number(b.value);
      }

      return String(a.value).localeCompare(String(b.value));
    });
  }

  private resolveNextAbleDay(value: boolean): boolean {
    return this.showNextAbleDay() ? value : false;
  }

  private configureControl<K extends DialogLeaveTypeControlName>(
    controlName: K,
    value: DialogLeaveTypeControlValue<K>,
    disabled: boolean,
  ): void {
    const control = this.form.controls[controlName] as FormControl<DialogLeaveTypeControlValue<K>>;
    control.setValue(value, { emitEvent: false });
    if (disabled) {
      control.disable({ emitEvent: false });
    } else {
      control.enable({ emitEvent: false });
    }
  }

  private getOuId(): number | null {
    return this.isEditMode
      ? this.data.leaveTypeOu.organizationalUnitId
      : (this.organizationalUnitService.getCurrentOrChildOU()?.id ?? null);
  }

  private buildCreatePayload(params: {
    leaveType: LeaveType;
    configLeaveOuId: number;
    organizationalUnitId: number;
    leaveGroupOuId: number;
  }): CreateLeaveTypeOuWithRulesPayload {
    const { organizationalUnitId, leaveGroupOuId, configLeaveOuId, leaveType } = params;
    const raw = this.form.getRawValue();

    return {
      leaveTypeOu: {
        isAccumulateDays: leaveType.isAccumulateDays ?? false,
        isAccumulateAdditionalDays: false,
        leaveTypeId: leaveType.id,
        organizationalUnitId,
        useNotifyDocument: false,
        documentationtypeId: 0,
        workflowApproveId: this.showWorkflowApprove() ? raw.workflowApproveId : undefined,
        leaveGroupOuId,
      },
      leaveRules: {
        configLeaveOuId,
        assignmentDayTypeId: raw.assignmentDayTypeId,
        quantityDays: this.showQuantityDays() ? raw.quantityDays : undefined,
        leaveMinDays: this.showLeaveMinDays() ? raw.leaveMinDays : undefined,
        leaveMaxDays: this.showLeaveMaxDays() ? raw.leaveMaxDays : undefined,
        leaveStartDay: this.showLeaveStartDay() ? raw.leaveStartDay : undefined,
        nextAbleDay: this.showNextAbleDaySection() ? this.resolveNextAbleDay(raw.nextAbleDay) : undefined,
        useConsecutiveDays: this.showUseConsecutiveDays() ? raw.useConsecutiveDays : undefined,
        isDocumentRequired: false,
      },
    };
  }
}
