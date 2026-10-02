import { Component, inject, OnInit } from '@angular/core';
import { LeaveService } from '../../shared/services/leave.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LeaveRequest } from '../../shared/models/leave-request.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-progress-massive-approve-requests',
  templateUrl: './progress-massive-approve-requests.component.html',
  styleUrls: ['./progress-massive-approve-requests.component.scss'],
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  providers: [LeaveService],
})
export class ProgressMassiveApproveRequestsComponent implements OnInit {
  public arrIds: string[] = inject(MAT_DIALOG_DATA);
  todo = true;
  count = 0;
  percent = 0;
  length: number = this.arrIds.length;
  leave: LeaveRequest;

  private readonly dialogRef = inject(MatDialogRef<ProgressMassiveApproveRequestsComponent>);
  private readonly leaveService = inject(LeaveService);

  ngOnInit(): void {
    this.dialogRef.afterOpened().subscribe(() => this.main());
  }

  private execute(element: string) {
    this.leave = new LeaveRequest();
    this.leave.id = element;
    this.leaveService
      .approveOrRejectLeaveRequest(this.leave, true)
      .pipe(
        finalize(() => {
          this.count = this.count + 1;
          this.percent = Math.round((this.count / this.length) * 100);
          if (this.count < this.length && this.todo) this.main();
          else {
            this.dialogRef.close();
            this.todo = false;
          }
        }),
      )
      .subscribe();
  }

  private main() {
    const element = this.arrIds.shift();
    this.execute(element);
  }
}
