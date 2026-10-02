import { Component, inject, computed, viewChild, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
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
import { ActivatedRoute, Router } from '@angular/router';
import { GroupDetails, FindGroupsRequest, FindGroupsResponse } from '../../../models/group';
import { GroupService } from '../../../../shared/services/group.service';
import { OrganizationalUnitService } from '../../../../shared/services/organizational-unit.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyStateComponent } from "../../../../shared/components/empty-state/empty-state.component";
import {
  DialogGroupFormComponent,
  DialogGroupFormData,
} from '../../../../shared/components/dialog-group-form/dialog-group-form.component';
import { MatDialog } from '@angular/material/dialog';
import { InfoChipComponent } from "../../../../shared/info-chip/info-chip.component";

@Component({
  selector: 'hl-group-list',
  templateUrl: './group-list.component.html',
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
    MatButtonModule,
    MatMenuModule,
    TranslocoDirective,
    TranslocoPipe,
    MatProgressSpinner,
    EmptyStateComponent,
    InfoChipComponent
],
  providers: [
    {
      provide: MAT_MENU_DEFAULT_OPTIONS,
      useValue: { overlayPanelClass: 'mf-hl-tailwind-scope' },
    },
  ],
})
export class GroupListComponent {
  displayedColumns: string[] = ['group', 'id', 'description', 'employees', 'status', 'actions'];
  readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  readonly page = signal(1);
  readonly pageSize = signal(5);

  readonly dataSource = computed(() => {
    return new MatTableDataSource<GroupDetails>(this.groups()?.data ?? []);
  });

  readonly paginator = viewChild(MatPaginator);

  private readonly router = inject(Router);
  private readonly groupService = inject(GroupService);
  private readonly ouService = inject(OrganizationalUnitService);
  private readonly ouId = this.ouService.getCurrentOU()?.id;
  private readonly dialog = inject(MatDialog);
  private readonly groupsResource = rxResource<FindGroupsResponse, FindGroupsRequest>({
    params: () => {
      if (!this.ouId) return undefined;
      return { organizationalUnitId: this.ouId, page: this.page(), itemPageSize: this.pageSize() };
    },
    stream: ({ params }) => this.groupService.findGroups(params),
  });

  readonly groups = computed(() => this.groupsResource.value());
  readonly isLoading = computed(() => this.groupsResource.isLoading());

  viewDetail(element: GroupDetails) {
    this.router.navigate(['details', element.id], { relativeTo: this.activatedRoute });
  }

  openEditGroupDialog(element: GroupDetails) {
    const data: DialogGroupFormData = { mode: 'edit', group: element };
    const dialogRef = this.dialog.open(DialogGroupFormComponent, {
      panelClass: ['full-screen-dialog', 'mf-hl-tailwind-scope'],
      data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.reloadGroups();
      }
    });
  }

  openCreateGroupDialog() {
    const data: DialogGroupFormData = { mode: 'create' };
    const dialogRef = this.dialog.open(DialogGroupFormComponent, {
      panelClass: ['full-screen-dialog', 'mf-hl-tailwind-scope'],
      data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.reloadGroups();
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.page.set(event.pageIndex + 1); // Convert from 0-based to 1-based
    this.pageSize.set(event.pageSize);
  }

  reloadGroups() {
    this.groupsResource.reload();
  }
}
