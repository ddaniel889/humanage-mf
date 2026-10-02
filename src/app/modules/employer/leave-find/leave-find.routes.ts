import { Routes } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';
import { EmployeeService } from '../../shared/services/employee.service';
import { EmployeeLeaveService } from '../../shared/services/employee-leave-requests.service';
import { LeaveService } from '../../shared/services/leave.service';
import { UiNotificationsService } from '../../shared/services/ui-notifications.service';

export default [
  {
    path: '',
    loadComponent: () => import('./leave-find.component').then((m) => m.LeaveFindComponent),
    providers: [
      provideNgxMask(),
      EmployeeService,
      EmployeeLeaveService,
      LeaveService,
      UiNotificationsService,
    ],
  },
] as Routes;
