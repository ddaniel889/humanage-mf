import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./welcome').then(m => m.Welcome),
  },
] as Routes;
