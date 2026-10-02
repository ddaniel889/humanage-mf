import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { FindGroupsResponse, GroupDetails } from '../../../../convenios/models/group';
import { MessageService } from '../../../../shared/errorHandler/message.service';
import { GroupService } from '../../../../shared/services/group.service';

export interface DialogAddGroupToLeaveTypeData {
  organizationalUnitId: number;
  leaveTypeId: number;
  leaveTypeNameKey: string;
}

const EMPTY_GROUPS_RESPONSE: FindGroupsResponse = {
  currentPage: 1,
  totalPages: 0,
  pageSize: 0,
  totalCount: 0,
  hasPrevious: false,
  hasNext: false,
  data: [],
};

@Component({
  selector: 'app-dialog-add-group-to-leave-type',
  templateUrl: './dialog-add-group-to-leave-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    TranslocoDirective,
    TranslocoPipe,
  ],
})
export class DialogAddGroupToLeaveTypeComponent {
  private readonly groupService = inject(GroupService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  readonly data = inject<DialogAddGroupToLeaveTypeData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DialogAddGroupToLeaveTypeComponent>);

  private readonly groupsResource = rxResource<FindGroupsResponse, {
    organizationalUnitId: number;
    leaveTypeId: number;
  }>({
    params: () => ({
      organizationalUnitId: this.data.organizationalUnitId,
      leaveTypeId: this.data.leaveTypeId,
    }),
    stream: ({ params }) =>
      this.groupService.findGroups({
        organizationalUnitId: params.organizationalUnitId,
        isActive: true,
        notInLeaveTypeId: params.leaveTypeId,
      }).pipe(
        catchError((error) => {
          this.messageService.showError(error);
          return of(EMPTY_GROUPS_RESPONSE);
        }),
      ),
  });

  readonly status = this.groupsResource.status;
  readonly groups = computed(() => this.groupsResource.value()?.data ?? []);
  readonly isScrollable = computed(() => this.groups().length > 5);
  readonly hasNoGroups = computed(() => (
    this.status() === 'resolved' &&
    this.groups().length === 0
  ));

  selected: GroupDetails | null = null;

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onConfirmClick(): void {
    if (!this.selected) return;
    this.dialogRef.close(this.selected);
  }

  onCreateGroupClick(): void {
    this.dialogRef.close();
    this.router.navigate(['/employer/settings/groups']);
  }
}
