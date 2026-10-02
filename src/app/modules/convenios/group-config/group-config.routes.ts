import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./group-config.component').then((m) => m.GroupConfigComponent),
  },
  {
    path: 'details/:groupId',
    loadChildren: () => import('../group-details/group-details.routes'),
  },
] as Routes;
