import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./group-details.component').then((m) => m.GroupDetailsComponent),
  },
] as Routes;
