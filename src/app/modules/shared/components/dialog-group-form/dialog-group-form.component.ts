import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import {
  FeedbackDialogComponent,
  FeedbackDialogData,
} from '../feedback-dialog/feedback-dialog.component';
import { GroupService } from '../../services/group.service';
import { OrganizationalUnitService } from '../../services/organizational-unit.service';
import {
  CreateGroupRequest,
  GroupDetails,
  UpdateGroupRequest,
} from '../../../convenios/models/group';
import { OrganizationalUnit } from '../../models';
import { MessageService } from '../../errorHandler/message.service';

export interface DialogGroupFormData {
  mode: 'create' | 'edit';
  group?: GroupDetails;
}

@Component({
  selector: 'hl-dialog-group-form',
  templateUrl: './dialog-group-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslocoDirective,
  ],
})
export class DialogGroupFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DialogGroupFormComponent>);
  private readonly dialog = inject(MatDialog);
  private readonly groupService = inject(GroupService);
  private readonly ouService = inject(OrganizationalUnitService);
  private readonly translocoService = inject(TranslocoService);
  private readonly data = inject<DialogGroupFormData>(MAT_DIALOG_DATA);
  private readonly messageService = inject(MessageService);

  readonly isLoading = signal(false);
  readonly isEditMode = this.data.mode === 'edit';

  readonly form = this.fb.group({
    name: [this.data.group?.name ?? '', [Validators.required, Validators.maxLength(40)]],
    description: [
      this.data.group?.description ?? '',
      [Validators.required, Validators.maxLength(60)],
    ],
    codeCct: [this.data.group?.codeCct ?? null, Validators.maxLength(20)],
  });

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSubmitClick(): void {
    if (this.form.invalid) return;

    const currentOU = this.ouService.getCurrentOrChildOU();
    if (!currentOU?.id) {
      console.error('No organizational unit available');
      return;
    }

    this.isLoading.set(true);

    if (this.isEditMode) {
      this.updateGroup(currentOU);
    } else {
      this.createGroup(currentOU);
    }
  }

  private updateGroup(currentOU: OrganizationalUnit): void {
    const groupData: UpdateGroupRequest = {
      id: this.data.group.id,
      description: this.form.value.description,
      isActive: this.data.group.enabled,
      name: this.form.value.name,
      organizationalUnitId: currentOU.id,
      reference: this.form.value.codeCct,
    };
    this.groupService
      .updateGroup(groupData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err) => {
          this.dialogRef.close();
          this.messageService.showError(err);
        },
      });
  }

  private createGroup(currentOU: OrganizationalUnit): void {
    const groupData: CreateGroupRequest = {
      id: 0,
      name: this.form.value.name,
      description: this.form.value.description,
      codeCct: this.form.value.codeCct,
      organizationalUnitId: currentOU.id,
      isActive: true,
      isDefault: false,
    };

    this.groupService
      .createGroup(groupData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err) => {
          this.dialogRef.close();
          this.messageService.showError(err);
        },
      });
  }

  private handleSuccess(): void {
    this.dialogRef.close(true);

    const prefix = 'groupConfig.dialogGroupForm';
    const data: FeedbackDialogData = {
      icon: 'fa-check',
      color: 'green',
      title: this.translocoService.translate(
        this.isEditMode ? `${prefix}.success.editTitle` : `${prefix}.success.createTitle`,
      ),
      description: this.translocoService.translate(`${prefix}.success.description`),
      confirmButtonText: this.translocoService.translate(`${prefix}.success.confirmButton`),
    };

    this.dialog.open(FeedbackDialogComponent, {
      panelClass: ['full-screen-dialog', 'mf-hl-tailwind-scope'],
      data,
    });
  }
}
