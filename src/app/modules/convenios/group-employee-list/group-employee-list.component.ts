import { SelectionModel } from '@angular/cdk/collections';
import { Component, input, output, inject, signal, computed, OnDestroy } from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MAT_MENU_DEFAULT_OPTIONS, MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { DialogAssignGroupComponent } from './components/dialog-assign-group/dialog-assign-group.component';
import { SideBarFilterComponent } from './components/side-bar-filter/side-bar-filter.component';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeData, FindGroupsResponse, GroupDetails, EmployeeFilter } from '../models/group';
import { TranslocoDirective } from '@jsverse/transloco';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { GroupService } from '../../shared/services/group.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { PaginatedResponse } from '../../shared/models/paginated-response';

@Component({
  selector: 'hl-group-employee-list',
  templateUrl: './group-employee-list.component.html',
  imports: [
    MatPaginator,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    MatRowDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    TranslocoDirective,
    MatProgressBarModule,
    EmptyStateComponent,
    NgxMaskPipe,
  ],
  providers: [
    {
      provide: MAT_MENU_DEFAULT_OPTIONS,
      useValue: { overlayPanelClass: 'mf-hl-tailwind-scope' },
    },
    provideNgxMask(),
  ],
})
export class GroupEmployeeListComponent implements OnDestroy {
  groupId = input<number | null>(null);
  groupData = input<GroupDetails[]>([]);
  heading = input.required<string>();
  tooltip = input<string | null>(null);
  showSelection = input<boolean>(false);
  showActions = input<boolean>(false);
  isNoGroupList = input<boolean>(false);
  employeeAssigned = output<void>();

  private readonly ouService = inject(OrganizationalUnitService);
  private readonly groupService = inject(GroupService);
  private readonly dialog = inject(MatDialog);

  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly searchText = signal('');
  readonly nameFilter = signal('');
  readonly sideBarFilter = signal<EmployeeFilter | null>(null);
  readonly dataSource = computed(
    () => new MatTableDataSource<EmployeeData>(this.employees.value()?.data ?? []),
  );

  private readonly organizationalUnit = this.ouService.getCurrentOrChildOU();
  readonly idFiscalMask = this.maskSplited(this.organizationalUnit.country.fiscalIdMask);

  readonly employees = rxResource({
    params: () => ({
      groupId: this.groupId(),
      currentPage: this.page(),
      itemPageSize: this.pageSize(),
      nameFilter: this.nameFilter(),
    }),
    stream: ({ params }) => {
      if (params.groupId) {
        return this.groupService
          .getGroupEmployees({
            groupId: params.groupId,
            organizationalUnitId: this.organizationalUnit?.id,
            currentPage: params.currentPage,
            itemPageSize: params.itemPageSize,
          })
          .pipe(
            map(
              (response): PaginatedResponse<EmployeeData[]> => ({
                ...response,
                data: response.data.items,
              }),
            ),
          );
      }

      return this.groupService
        .getEmployeesWithoutGroup({
          organizationUnitIds: this.organizationalUnit?.id
            ? [this.organizationalUnit?.id]
            : undefined,
          page: params.currentPage,
          itemPerPage: params.itemPageSize,
          isPaged: true,
          name: params.nameFilter || undefined,
        })
        .pipe(
          map(
            (response): PaginatedResponse<EmployeeData[]> => ({
              ...response,
              data: response.data.map((employee) => ({
                userId: employee.userId,
                firstName: employee.userName,
                lastName: employee.userLastName,
                idFiscal: Number(employee.cuil),
                nroLeg: employee.nroLegajo,
                groupId: 0,
              })),
            }),
          ),
        );
    },
  });

  readonly groups = rxResource<FindGroupsResponse, { organizationalUnitId: number }>({
    params: () => {
      const ouId = this.organizationalUnit.id;
      if (!ouId) {
        return undefined;
      }
      return { organizationalUnitId: ouId };
    },
    stream: ({ params }) => this.groupService.getGroupByOu(params.organizationalUnitId),
  });

  readonly displayedColumns = computed(() => {
    const columns = ['name', 'file', 'id', 'area', 'joinDate', 'spacer'];
    let filteredColumns = [...columns];

    if (this.showSelection()) {
      filteredColumns = ['select', ...filteredColumns];
    }

    if (this.showActions()) {
      filteredColumns = [...filteredColumns, 'actions'];
    }

    return filteredColumns;
  });

  selection = new SelectionModel<EmployeeData>(true, []);
  private nameFilterTimeout?: ReturnType<typeof setTimeout>;
  private readonly nameFilterDebounceMs = 300;
  private readonly minNameFilterLength = 3;

  readonly isLoading = computed(() => this.employees.isLoading());
  readonly totalCount = computed(() => this.employees.value()?.totalCount ?? 0);
  readonly hasActiveFilter = computed(() => {
    if (this.nameFilter().length > 0) return true;
    const filter = this.sideBarFilter();
    if (!filter) return false;
    return (
      filter.fiscalId.length > 0 ||
      filter.fileNumber.length > 0 ||
      filter.fileStatusActive ||
      filter.fileStatusInactive ||
      filter.signConditionEnabled ||
      filter.signConditionPending ||
      filter.signConditionDisabled ||
      filter.humanageAccessAccessed ||
      filter.humanageAccessNotAccessed
    );
  });

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource().data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource().data);
  }

  checkboxLabel(row?: EmployeeData, index?: number): string {
    if (row) {
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${index === undefined ? '' : index + 1}`;
    }
    return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
  }

  onNameFilterInput(value: string) {
    this.searchText.set(value);
    clearTimeout(this.nameFilterTimeout);

    const trimmedValue = value.trim();
    if (trimmedValue.length > 0 && trimmedValue.length < this.minNameFilterLength) {
      return;
    }

    this.nameFilterTimeout = setTimeout(() => {
      this.applyNameFilter(trimmedValue);
    }, this.nameFilterDebounceMs);
  }

  clearNameFilter() {
    clearTimeout(this.nameFilterTimeout);
    this.searchText.set('');
    this.applyNameFilter('');
  }

  ngOnDestroy() {
    clearTimeout(this.nameFilterTimeout);
  }

  private applyNameFilter(value: string) {
    if (this.nameFilter() === value) return;

    this.nameFilter.set(value);
    this.page.set(1);
  }

  openGroupAssingDialog() {
    this.openAssignDialog(this.selection.selected);
  }

  openSideFilter() {
    const dialogRef = this.dialog.open(SideBarFilterComponent, {
      panelClass: ['mf-hl-tailwind-scope'],
      position: { right: '0', top: '0' },
      height: '100vh',
      maxHeight: '100vh',
    });

    dialogRef.afterClosed().subscribe((result: EmployeeFilter | undefined) => {
      if (result) {
        this.sideBarFilter.set(result);
        this.page.set(1);
      }
    });
  }

  assignToGroup(employee?: EmployeeData) {
    this.openAssignDialog([employee]);
  }

  private openAssignDialog(employee: EmployeeData[]) {
    const ouId = this.organizationalUnit.id;
    const dialogRef = this.dialog.open(DialogAssignGroupComponent, {
      panelClass: ['dialog-paper', 'mf-hl-tailwind-scope'],
      width: '500px',
      data: {
        groups: this.groups.value().data,
        selectedEmployees: employee,
        organizationalUnitId: ouId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.selection.clear();
        this.employees.reload();
        this.employeeAssigned.emit();
      }
    });
  }

  private maskSplited(mask: string) {
    const masksplited = mask.split('||');
    return masksplited.at(-1) ?? mask;
  }
}
