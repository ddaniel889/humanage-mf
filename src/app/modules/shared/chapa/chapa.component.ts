import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LeaveRequestDetail } from '../models/leave-request-detail.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-chapa',
  templateUrl: './chapa.component.html',
  styleUrl: './chapa.component.scss',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatChipsModule, MatListModule],
  host: {
    class: 'tw-flex tw-flex-col tw-flex-grow tw-justify-center',
  },
})
export class ChapaComponent implements OnInit {
  @Input() className: string;
  @Input() icon?: string;
  @Input() text: string;
  @Input() subText: string;
  @Input() infoExtra: string;
  @Input() actionIcon: string;
  @Input() actionText: string;
  @Input() showButtonDoc = false;
  @Input() buttonColor = 'primary';
  @Input() isApprover = false;
  @Input() leaveDetail: LeaveRequestDetail = new LeaveRequestDetail();
  @Input() hasDocument = false;
  @Input() leaveRequestDraft = false;
  @Input() textDraft: string;
  @Input() headerDraft: string;
  @Input() isValidated: boolean;
  @Output() ApproveRejectClick = new EventEmitter();
  @Output() ViewDocumentClick = new EventEmitter();
  @Output() actionClick = new EventEmitter();
  noteCancelation = false;

  ngOnInit() {
    if (this.leaveDetail.state?.key == '4') {
      this.noteCancelation = true;
    } else {
      this.noteCancelation = false;
    }
  }

  click() {
    this.actionClick.emit();
  }
  approveReject(value: boolean) {
    this.ApproveRejectClick.emit(value);
  }
  viewDocumentLeave() {
    this.ViewDocumentClick.emit();
  }
  getDateTime(value: string | Date) {
    const date = new Date(value);
    if (date.getMinutes().toString().length == 1) {
      return `${date.toLocaleDateString()} ${date.getHours()}:0${date.getMinutes()}`;
    }
    return date.toLocaleDateString() + ' ' + date.getHours() + ':' + date.getMinutes();
  }
  isNotsameApprover() {
    return (
      this.leaveDetail.actionApprovers &&
      !this.leaveDetail.actionApprovers.some(
        (x) => (x.action == 3 || x.action == 2) && x.userId == this.leaveDetail.state.userId,
      )
    );
  }
  getIcon() {
    switch (this.leaveDetail.state?.key) {
      case '0':
        return 'fa-pen-nib';
      case '3':
        return 'fa-frown';
      case '2':
        return 'fa-smile';
    }
    return '';
  }
  getClass() {
    switch (this.leaveDetail.state?.key) {
      case '0':
        return 'draft';
      case '3':
        return 'signed-not-ok';
      case '2':
        return 'signed-ok';
    }
    return '';
  }

  getDescriptionRol() {
    const date = new Date(this.leaveDetail.state.stateDate);
    switch (this.leaveDetail.state?.key) {
      case '4':
        return 'Motivo: ' + this.leaveDetail.state.note;
      case '3':
        if (date.getMinutes().toString().length == 1) {
          return `Rechazado por  ${this.leaveDetail.state.userName} el ${date.toLocaleDateString()} ${date.getHours()}:0${date.getMinutes()}`;
        }
        return (
          'Rechazado por ' +
          this.leaveDetail.state.userName +
          ' el ' +
          date.toLocaleDateString() +
          ' ' +
          date.getHours() +
          ':' +
          date.getMinutes()
        );
      case '2':
        if (date.getMinutes().toString().length == 1) {
          return `Aprobado por  ${this.leaveDetail.state.userName} el ${date.toLocaleDateString()} ${date.getHours()}:0${date.getMinutes()}`;
        }
        return (
          'Aprobado por ' +
          this.leaveDetail.state.userName +
          ' el ' +
          date.toLocaleDateString() +
          ' ' +
          date.getHours() +
          ':' +
          date.getMinutes()
        );
    }
    return '';
  }

  showActionRol() {
    return this.leaveDetail.state?.key == '0' || this.leaveDetail.state?.key == '1';
  }

  workflowApproveShow(): boolean {
    const showRejctBtn =
      this.leaveDetail.state.key == '2' &&
      this.leaveDetail.configLeaveOu.leaveTypeOu.workflowApprove?.id == 3;
    const today = new Date().setHours(0, 0, 0, 0);
    const startDate = new Date(this.leaveDetail.startDate).setHours(0, 0, 0, 0);
    return showRejctBtn && today < startDate;
  }
}
