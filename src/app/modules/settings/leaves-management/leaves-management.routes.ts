import { Routes } from '@angular/router';
import { LeaveService } from '../../shared/services/leave.service';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/leave-type-list/leave-type-list').then((m) => m.LeaveTypeList),
    providers: [
      LeaveService
    ],
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/leave-type-detail/leave-type-detail').then((m) => m.LeaveTypeDetail),
    providers: [
      LeaveService
    ],
  },
] as Routes;
