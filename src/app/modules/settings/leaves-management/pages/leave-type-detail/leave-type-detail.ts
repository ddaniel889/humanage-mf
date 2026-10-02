import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MAT_MENU_DEFAULT_OPTIONS, MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { catchError } from 'rxjs';
import { ChapaComponent } from '../../../../shared/chapa/chapa.component';
import { LeaveTypeDetailFields } from '../../components/leave-type-detail-fields/leave-type-detail-fields';
import { LeaveService } from '../../../../shared/services/leave.service';
import { MessageService } from '../../../../shared/errorHandler/message.service';
import { OrganizationalUnitService } from '../../../../shared/services/organizational-unit.service';
import {
  getLeaveTypeKey,
  LeaveTypeDetailDto,
  LeaveTypeOuDetailDto,
} from '../../../../shared/models/Employee';
import { InfoChipComponent } from '../../../../shared/info-chip/info-chip.component';
import {
  DialogLeaveTypeFormComponent,
  DialogLeaveTypeFormData,
} from '../../components/dialog-leave-type-form/dialog-leave-type-form.component';
import { LeaveTypeAddGroupDialogService } from '../../services/leave-type-add-group-dialog.service';

@Component({
  selector: 'app-leave-type-detail',
  imports: [
    ChapaComponent,
    LeaveTypeDetailFields,
    MatButtonModule,
    MatExpansionModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterLink,
    TranslocoDirective,
    TranslocoPipe,
    InfoChipComponent,
  ],
  templateUrl: './leave-type-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MAT_MENU_DEFAULT_OPTIONS,
      useValue: { overlayPanelClass: 'mf-hl-tailwind-scope' },
    },
  ],
})
export class LeaveTypeDetail {
  private readonly leaveService = inject(LeaveService);
  private readonly messageService = inject(MessageService);
  private readonly ouService = inject(OrganizationalUnitService);
  private readonly addGroupDialogService = inject(LeaveTypeAddGroupDialogService);
  private readonly dialog = inject(MatDialog);

  readonly id = input.required<string>();
  readonly leaveTypeId = computed(() => Number(this.id()));
  readonly ouId = this.ouService.getCurrentOU().id;

  private readonly leaveTypeDetailResource = rxResource<
    LeaveTypeDetailDto,
    { leaveTypeId: number; ouId: number }
  >({
    params: () => ({ leaveTypeId: this.leaveTypeId(), ouId: this.ouId }),
    stream: (p) =>
      this.leaveService.getLeaveTypeDetail(p.params.leaveTypeId, p.params.ouId).pipe(
        catchError((error) => {
          this.messageService.showError(error);
          throw error;
        }),
      ),
  });

  readonly status = this.leaveTypeDetailResource.status;
  readonly error = this.leaveTypeDetailResource.error;

  readonly leaveTypeNameKey = computed(() => {
    const leaveType = this.details()[0]?.leaveType;
    return leaveType ? getLeaveTypeKey(leaveType.id, leaveType.description) : '';
  });
  readonly details = computed(() => this.leaveTypeDetailResource.value()?.leaveTypesOu ?? []);

  onAddGroupClick(): void {
    const leaveType = this.details()[0]?.leaveType;
    if (!leaveType) return;

    this.addGroupDialogService.open({
      organizationalUnitId: this.ouId,
      leaveType,
      leaveTypeNameKey: this.leaveTypeNameKey(),
    }).subscribe((wasCreated) => {
      if (wasCreated) {
        this.leaveTypeDetailResource.reload();
      }
    });
  }

  onEditClick(detail: LeaveTypeOuDetailDto): void {
    const dialogRef = this.dialog.open(DialogLeaveTypeFormComponent, {
      panelClass: ['full-screen-dialog', 'mf-hl-tailwind-scope'],
      data: { mode: 'edit', leaveTypeOu: detail } satisfies DialogLeaveTypeFormData,
    });

    dialogRef.afterClosed().subscribe((wasUpdated) => {
      if (wasUpdated) {
        this.leaveTypeDetailResource.reload();
      }
    });
  }
}
