import { Component, inject, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GroupEmployeeListComponent } from '../group-employee-list/group-employee-list.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GroupDetails } from '../models/group';
import { rxResource } from '@angular/core/rxjs-interop';
import { GroupService } from '../../shared/services/group.service';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';
import {
  DialogGroupFormComponent,
  DialogGroupFormData,
} from '../../shared/components/dialog-group-form/dialog-group-form.component';
import { MatDialog } from '@angular/material/dialog';
import { InfoChipComponent } from '../../shared/info-chip/info-chip.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'hl-group-details',
  templateUrl: './group-details.component.html',
  imports: [
    MatButtonModule,
    MatIconModule,
    GroupEmployeeListComponent,
    TranslocoDirective,
    TranslocoPipe,
    RouterLink,
    InfoChipComponent,
    MatProgressSpinner,
  ],
  providers: [],
})
export class GroupDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(GroupService);
  private readonly ouService = inject(OrganizationalUnitService);
  private readonly dialog = inject(MatDialog);
  readonly groupId = computed(() => {
    const id = this.route.snapshot.paramMap.get('groupId');
    return id ? Number(id) : 0;
  });

  private readonly organizationalUnitId = computed(() => {
    const currentOU = this.ouService.getCurrentOrChildOU();
    return currentOU?.id;
  });

  readonly group = rxResource<GroupDetails | undefined, { id: number; ouId: number | undefined }>({
    params: () => ({ id: this.groupId(), ouId: this.organizationalUnitId() }),
    stream: ({ params }) => {
      if (!params.ouId) {
        throw new Error('No organizational unit available');
      }
      return this.groupService.getGroupByOu(params.ouId).pipe(
        map((response) => {
          return response.data.find((group) => group.id === params.id) ?? response.data[0];
        }),
      );
    },
  });

  readonly isLoading = computed(() => this.group.isLoading());

  readonly groupStatus = computed(() => {
    const groupData = this.group.value();
    if (!groupData) return { text: '', color: 'green' as const };
    return groupData.enabled
      ? { text: 'common.status.active', color: 'green' as const }
      : { text: 'common.status.inactive', color: 'red' as const };
  });

  onEditGroup() {
    const currentGroup = this.group.value();
    if (!currentGroup) return;

    const data: DialogGroupFormData = {
      mode: 'edit',
      group: currentGroup,
    };

    const dialogRef = this.dialog.open(DialogGroupFormComponent, {
      panelClass: ['full-screen-dialog', 'mf-hl-tailwind-scope'],
      data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.group.reload();
      }
    });
  }
}
