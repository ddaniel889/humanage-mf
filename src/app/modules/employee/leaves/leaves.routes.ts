import { Routes } from '@angular/router';
import { EmployeeLeaveService } from '../../shared/services/employee-leave-requests.service';
import { LeaveService } from '../../shared/services/leave.service';
import { UiNotificationsService } from '../../shared/services/ui-notifications.service';

export default [
  {
    path: '',
    loadComponent: () => import('./leave.component').then((m) => m.LeavesComponent),
    providers: [EmployeeLeaveService, LeaveService, UiNotificationsService],
    children: [
      {
        path: 'welcome',
        loadChildren: () => import('../welcome/welcome.routes'),
      },
      {
        path: 'detalle/:id/:isApprover',
        loadComponent: () => import('./leave-detail/leave-detail.component').then((m) => m.LeaveDetailComponent),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'welcome',
      },
    ],
  },
] as Routes;
