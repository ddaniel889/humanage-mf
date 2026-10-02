import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, of } from 'rxjs';
import {
  LeaveTypeTableAddGroupRequestedEvent,
  LeaveTypeTableComponent,
} from '../../components/leave-type-table/leave-type-table.component';
import {
  DialogLeaveTypeFormComponent,
  DialogLeaveTypeFormData,
} from '../../components/dialog-leave-type-form/dialog-leave-type-form.component';
import { LeaveService } from '@shared/services/leave.service';
import { OrganizationalUnitService } from '@shared/services/organizational-unit.service';
import { MessageService } from '@shared/errorHandler/message.service';
import { LeaveType, LeaveTypeOuSummaryResponse } from '@shared/models/Employee';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { LeaveTypeAddGroupDialogService } from '../../services/leave-type-add-group-dialog.service';

@Component({
  selector: 'hl-leave-type-list-page',
  imports: [
    TranslocoDirective,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    LeaveTypeTableComponent,
    EmptyStateComponent
],
  templateUrl: './leave-type-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveTypeList {
  private readonly ouService = inject(OrganizationalUnitService);
  private readonly messageService = inject(MessageService);
  private readonly leaveService = inject(LeaveService);
  private readonly addGroupDialogService = inject(LeaveTypeAddGroupDialogService);
  private readonly dialog = inject(MatDialog);
  readonly transloco = inject(TranslocoService);

  ouId = this.ouService.getCurrentOU().id;

  private readonly leavesResource = rxResource<LeaveTypeOuSummaryResponse, { ouId: number }>({
    params: () => ({ ouId: this.ouId }),
    stream: (p) => this.leaveService.getLeaveTypeOuSummary(p.params.ouId).pipe(
      catchError(error => {
        this.messageService.showError(error);
        return [];
      })
    ),
  });
  private readonly availableLeaveTypesResource = rxResource<LeaveType[], { ouId: number }>({
    params: () => ({ ouId: this.ouId }),
    stream: (p) => this.leaveService.getAvailableLeaveTypesByOu(p.params.ouId).pipe(
      catchError((error) => {
        this.messageService.showError(error);
        return of([]);
      }),
    ),
  });

  readonly leaves = this.leavesResource.value.asReadonly();
  readonly status = this.leavesResource.status;
  readonly error = this.leavesResource.error;
  readonly availableLeaveTypes = this.availableLeaveTypesResource.value.asReadonly();
  readonly isCreateLeaveDisabled = computed(() => {
    const status = this.availableLeaveTypesResource.status();
    if (status === 'loading' || status === 'reloading') {
      return true;
    }

    return this.availableLeaveTypes().length === 0;
  });

  reload() {
    this.leavesResource.reload();
    this.availableLeaveTypesResource.reload();
  }

  onCreateClick() {
    if (this.isCreateLeaveDisabled()) {
      return;
    }

    const dialogRef = this.dialog.open(DialogLeaveTypeFormComponent, {
      panelClass: ['full-screen-dialog', 'mf-hl-tailwind-scope'],
      data: { mode: 'create' } satisfies DialogLeaveTypeFormData,
    });

    dialogRef.afterClosed().subscribe((wasCreated) => {
      if (wasCreated) {
        this.leavesResource.reload();
        this.availableLeaveTypesResource.reload();
      }
    });
  }

  onAddGroupClick(event: LeaveTypeTableAddGroupRequestedEvent): void {
    this.addGroupDialogService.open({
      organizationalUnitId: this.ouId,
      leaveType: {
        id: event.leaveTypeId,
        description: event.leaveTypeDescription,
      },
      leaveTypeNameKey: event.leaveTypeKey,
    }).subscribe((wasCreated) => {
      if (wasCreated) {
        this.leavesResource.reload();
        this.availableLeaveTypesResource.reload();
      }
    });
  }
}
