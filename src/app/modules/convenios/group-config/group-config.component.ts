import { Component, computed, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { GroupListComponent } from './components/group-list/group-list.component';
import { GroupEmployeeListComponent } from '../group-employee-list/group-employee-list.component';
import { TranslocoDirective } from '@jsverse/transloco';
@Component({
  selector: 'hl-group-config',
  templateUrl: './group-config.component.html',
  imports: [MatButtonModule, GroupListComponent, GroupEmployeeListComponent, TranslocoDirective],
  providers: [],
})
export class GroupConfigComponent {
  private readonly groupList = viewChild.required(GroupListComponent);
  private readonly employeeList = viewChild.required(GroupEmployeeListComponent);

  readonly groups = computed(() => this.groupList().groups()?.data);
  readonly isEmployeeListLoading = computed(() => this.employeeList().isLoading());
  readonly employeeCount = computed(() => this.employeeList().totalCount());
  readonly hasActiveEmployeeFilter = computed(() => this.employeeList().hasActiveFilter());

  reloadGroupData(): void {
    this.groupList().reloadGroups();
  }
}
