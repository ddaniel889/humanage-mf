import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { GroupDetails, EmployeeData } from '../../../models/group';
import { DialogAssignSuccessComponent } from '../dialog-assign-success/dialog-assign-success.component';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { GroupService } from '../../../../shared/services/group.service';
import { MessageService } from '../../../../shared/errorHandler/message.service';

@Component({
  selector: 'app-dialog-assign-group',
  templateUrl: './dialog-assign-group.component.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatRadioModule,
    TranslocoDirective,
    TranslocoPipe,
  ],
})
export class DialogAssignGroupComponent {
  readonly data = inject<{
    groups: GroupDetails[];
    selectedEmployees: EmployeeData[];
    organizationalUnitId: number;
  }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DialogAssignGroupComponent>);
  readonly dialog = inject(MatDialog);
  readonly groups = signal(this.data.groups);
  readonly isScrollable = computed(() => this.groups().length > 5);
  private readonly groupService = inject(GroupService);
  private readonly messageService = inject(MessageService);
  private readonly transloco = inject(TranslocoService);

  selected: GroupDetails | null = null;

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onAssignClick(): void {
    if (!this.selected) return;

    this.groupService
      .assignEmployeeToGroup({
        GroupId: this.selected.id,
        UserIds: this.data.selectedEmployees.map((e) => e.userId),
        OrganizationalUnitId: this.data.organizationalUnitId,
      })
      .subscribe({
        next: (response) => {
          if (response.totalFailed > 0) {
            const message = this.transloco.translate('dialogAssignGroup.assignFailed', {
              count: response.totalFailed,
            });
            this.messageService.showInfo(message, true, true);
          }
          this.handleSuccess(response.totalRequested - response.totalFailed);
        },
        error: (err) => {
          this.dialogRef.close();
          this.messageService.showError(err);
        },
      });
  }

  private handleSuccess(assignedCount: number): void {
    this.dialogRef.close(true);

    this.dialog.open(DialogAssignSuccessComponent, {
      panelClass: ['dialog-paper', 'mf-hl-tailwind-scope'],
      width: '500px',
      data: { group: this.selected, count: assignedCount },
    });
  }
}
