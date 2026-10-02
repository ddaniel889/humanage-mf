/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MessageAtributtes, MessageType } from '../models/message-types.model';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-generic-bottom-sheet',
  templateUrl: './generic-bottom-sheet.component.html',
  styles: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    TranslocoModule,
  ],
  host: { class: 'mf-hl-tailwind-scope' },
})
// NOTE: The legacy component had an @Output() close EventEmitter. During migration,
// it was replaced by bottomSheetRef.dismiss(), which is the standard Angular Material pattern.
// Callers should use afterDismissed() instead of instance.close to receive the response.
export class GenericBottomSheetComponent implements OnInit {
  showHelp = false;
  code: string;
  textArea = '';
  selectedOption: string;
  durationFormLeave: UntypedFormGroup;
  StartDate: UntypedFormControl;
  EndDate: UntypedFormControl;
  MinDate: Date;
  MaxDate: Date;
  HastaMinDate: Date;
  fechaInicio: Date;
  fechaFin: Date;
  inForms = [];
  outIds = [];

  private readonly _formBuilder = inject(UntypedFormBuilder);
  private readonly bottomSheetRef = inject(MatBottomSheetRef<GenericBottomSheetComponent>);
  public readonly data: MessageAtributtes = inject(MAT_BOTTOM_SHEET_DATA);

  constructor() {
    this.durationFormLeave = this._formBuilder.group({
      StartDate: ['', Validators.required],
      EndDate: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.data.type == MessageType.ExportCancel) {
      const date = new Date();
      this.MinDate = this.calculateMinDate();
      this.MaxDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      this.HastaMinDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      this.inForms = this.data.actions;
    }
  }

  action(value: any) {
    if (
      this.data.type === MessageType.TextAreaYesNo ||
      this.data.type === MessageType.ApproveReject ||
      this.data.type === MessageType.CancelLeave
    ) {
      const textAreaResponse = {
        response: value,
        text: this.textArea,
      };
      this.bottomSheetRef.dismiss(textAreaResponse);
    } else if (this.data.type === MessageType.MultipleActions && value) {
      value.execute();
      this.bottomSheetRef.dismiss(true);
    } else if (this.data.type === MessageType.ExportCancel) {
      if (value) {
        const { StartDate, EndDate } = this.durationFormLeave.value;
        const formBusqueda = {
          startDate: StartDate,
          endDate: EndDate,
          ids: this.outIds,
        };
        this.bottomSheetRef.dismiss(formBusqueda);
      } else {
        this.bottomSheetRef.dismiss(value);
      }
    } else if (this.data.type === MessageType.Assign) {
      this.bottomSheetRef.dismiss(value);
    } else {
      this.bottomSheetRef.dismiss(value);
    }
  }

  exportbuttonEnabled() {
    const { StartDate, EndDate } = this.durationFormLeave.value;
    return StartDate === '' || EndDate === '' || this.outIds.length == 0;
  }

  calculateMinDate(): Date {
    const today = new Date();
    const range = Number(environment.application.noveltiesDayRange);

    if (Number.isNaN(range)) {
      console.warn(`Invalid noveltiesDayRange: ${environment.application.noveltiesDayRange}, using 3 months`);
      return new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    }

    const result = new Date();
    result.setDate(result.getDate() - range);
    return result;
  }

  setHastaMaxDate(event: any) {
    this.HastaMinDate = event.value;
  }

  setForm(docType: any, event: any) {
    if (event.checked) {
      this.outIds.push(docType.id);
    } else {
      const index = this.outIds.indexOf(docType.id, 0);
      if (index > -1) {
        this.outIds.splice(index, 1);
      }
    }
  }
  disableButton() {
    if (!this.textArea || this.textArea.trim() === '') {
      return true;
    }
    return false;
  }
}
