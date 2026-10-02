import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./welcome.component').then((m) => m.WelcomeComponent),
  },
] as Routes;
