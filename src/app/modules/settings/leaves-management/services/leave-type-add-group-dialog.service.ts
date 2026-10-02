import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LeaveType } from '@shared/models/Employee';
import { map, of, switchMap } from 'rxjs';
import { GroupDetails } from '../../../convenios/models/group';
import {
  DialogAddGroupToLeaveTypeComponent,
  DialogAddGroupToLeaveTypeData,
} from '../components/dialog-add-group-to-leave-type/dialog-add-group-to-leave-type.component';
import {
  DialogLeaveTypeFormComponent,
  DialogLeaveTypeFormData,
} from '../components/dialog-leave-type-form/dialog-leave-type-form.component';

export interface LeaveTypeAddGroupDialogContext {
  organizationalUnitId: number;
  leaveType: LeaveType;
  leaveTypeNameKey: string;
}

@Injectable({
  providedIn: 'root',
})
export class LeaveTypeAddGroupDialogService {
  private readonly dialog = inject(MatDialog);

  open(context: LeaveTypeAddGroupDialogContext) {
    return this.openGroupSelectorDialog(context).afterClosed().pipe(
      switchMap((selectedGroup) => {
        if (!selectedGroup) {
          return of(false);
        }

        return this.openCreateDialog(context.leaveType, selectedGroup).afterClosed().pipe(
          map(Boolean),
        );
      }),
    );
  }

  private openGroupSelectorDialog(context: LeaveTypeAddGroupDialogContext) {
    return this.dialog.open<
      DialogAddGroupToLeaveTypeComponent,
      DialogAddGroupToLeaveTypeData,
      GroupDetails | undefined
    >(DialogAddGroupToLeaveTypeComponent, {
      panelClass: ['dialog-paper', 'mf-hl-tailwind-scope'],
      width: '500px',
      data: {
        organizationalUnitId: context.organizationalUnitId,
        leaveTypeId: context.leaveType.id,
        leaveTypeNameKey: context.leaveTypeNameKey,
      } satisfies DialogAddGroupToLeaveTypeData,
    });
  }

  private openCreateDialog(leaveType: LeaveType, selectedGroup: GroupDetails) {
    return this.dialog.open(DialogLeaveTypeFormComponent, {
      panelClass: ['full-screen-dialog', 'mf-hl-tailwind-scope'],
      data: {
        mode: 'create',
        preselectedLeaveType: leaveType,
        preselectedLeaveGroup: this.toPreselectedLeaveGroup(selectedGroup),
      } satisfies DialogLeaveTypeFormData,
    });
  }

  private toPreselectedLeaveGroup(
    group: GroupDetails,
  ): NonNullable<DialogLeaveTypeFormData['preselectedLeaveGroup']> {
    return { id: group.id, name: group.name, isActive: group.enabled };
  }
}
