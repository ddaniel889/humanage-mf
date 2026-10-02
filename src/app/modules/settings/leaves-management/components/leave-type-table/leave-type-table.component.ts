import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
  viewChild,
  inject,
  output,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { MAT_MENU_DEFAULT_OPTIONS, MatMenuModule } from '@angular/material/menu';
import {
  MatTable,
  MatTableDataSource,
  MatColumnDef,
  MatHeaderCellDef,
  MatCellDef,
  MatHeaderRowDef,
  MatRowDef,
  MatHeaderCell,
  MatCell,
  MatHeaderRow,
  MatRow,
} from '@angular/material/table';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { getLeaveTypeKey, LeaveTypeOuSummary } from '../../../../shared/models/Employee';
import { MatIconModule } from '@angular/material/icon';

interface Row {
  leaveTypeId: number;
  leaveTypeDescription: string;
  leaveTypeKey: string;
  assignment: string;
}

export interface LeaveTypeTableAddGroupRequestedEvent {
  leaveTypeId: number;
  leaveTypeDescription: string;
  leaveTypeKey: string;
}

@Component({
  selector: 'hl-leave-type-table',
  templateUrl: './leave-type-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCell,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIconModule,
    MatMenuModule,
    MatPaginator,
    MatRowDef,
    MatRow,
    MatTable,
    TranslocoDirective,
    TranslocoPipe,
  ],
  providers: [
    {
      provide: MAT_MENU_DEFAULT_OPTIONS,
      useValue: { overlayPanelClass: 'mf-hl-tailwind-scope' },
    },
  ],
})
export class LeaveTypeTableComponent {
  private readonly router = inject(Router);
  // Add 'actions' when action buttons are implemented
  readonly displayedColumns: string[] = ['type', 'assignment', 'actions'];
  readonly addGroupRequested = output<LeaveTypeTableAddGroupRequestedEvent>();

  readonly data = input.required<LeaveTypeOuSummary[]>();
  private readonly rows = computed<Row[]>(() =>
    this.data().map((item) => ({
      leaveTypeId: item.leaveTypeId,
      leaveTypeDescription: item.description,
      leaveTypeKey: getLeaveTypeKey(item.leaveTypeId, item.description),
      assignment: item.groups.map((g) => g.name).join('; '),
    })),
  );

  readonly paginator = viewChild(MatPaginator);
  readonly dataSource = computed(() => {
    const source = new MatTableDataSource<Row>(this.rows());
    const paginator = this.paginator();
    if (paginator) {
      source.paginator = paginator;
    }
    return source;
  });

  readonly leavesCount = computed(() => this.data().length);

  viewDetail(row: Row) {
    this.router.navigate(['/employer/settings/leaves/leaves-management', row.leaveTypeId]);
  }

  onAddGroupClick(row: Row) {
    this.addGroupRequested.emit({
      leaveTypeId: row.leaveTypeId,
      leaveTypeDescription: row.leaveTypeDescription,
      leaveTypeKey: row.leaveTypeKey,
    });
  }
}
