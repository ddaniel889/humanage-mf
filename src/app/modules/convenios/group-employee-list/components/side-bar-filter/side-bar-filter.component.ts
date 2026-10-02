import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslocoDirective } from '@jsverse/transloco';
import { EmployeeFilter } from '../../../models/group';

@Component({
  selector: 'app-side-bar-filter',
  templateUrl: './side-bar-filter.component.html',
  imports: [
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIcon,
    TranslocoDirective,
    ReactiveFormsModule,
  ],
})
export class SideBarFilterComponent {
  private readonly dialogRef = inject(MatDialogRef<SideBarFilterComponent>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    fiscalId: '',
    fileNumber: '',
    fileStatusActive: false,
    fileStatusInactive: false,
    signConditionEnabled: false,
    signConditionPending: false,
    signConditionDisabled: false,
    humanageAccessAccessed: false,
    humanageAccessNotAccessed: false,
  });

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.dialogRef.close(this.form.getRawValue() as EmployeeFilter);
  }
}
