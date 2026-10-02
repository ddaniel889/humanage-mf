import { Routes } from '@angular/router';
import { InlineLoader, provideTranslocoScope, TranslocoScope } from '@jsverse/transloco';

const createTranslocoLoader = (path: string): InlineLoader =>
  ['en', 'es', 'pt'].reduce<InlineLoader>((acc, lang) => {
    acc[lang] = () => import(`./core/i18n/${path}/${lang}.json`);
    return acc;
  }, {});

const SCOPE_COMMON: TranslocoScope = { scope: 'common', loader: createTranslocoLoader('common') };
const SCOPE_ERRORS: TranslocoScope = { scope: 'errors', loader: createTranslocoLoader('errors') };
const SCOPE_LEAVES: TranslocoScope = { scope: 'leaves', loader: createTranslocoLoader('leaves') };
const SCOPE_GROUP_CONFIG: TranslocoScope = { scope: 'groupConfig', loader: createTranslocoLoader('group-config') };

const provideTranslocoScopes = (...extra: TranslocoScope[]) =>
  provideTranslocoScope(SCOPE_COMMON, SCOPE_ERRORS, ...extra);

export const routes: Routes = [
  {
    path: 'employee/leaves',
    loadChildren: () => import('./modules/employee/leaves/leaves.routes'),
    providers: [provideTranslocoScopes(SCOPE_LEAVES)],
  },
  {
    path: 'employee/leaves/:id',
    loadChildren: () => import('./modules/employee/leaves/leaves.routes'),
    providers: [provideTranslocoScopes(SCOPE_LEAVES)],
  },
  {
    path: 'employer/leave-find',
    pathMatch: 'full',
    loadChildren: () => import('./modules/employer/leave-find/leave-find.routes'),
    providers: [provideTranslocoScopes(SCOPE_LEAVES)],
  },
  {
    path: 'employer/settings/groups',
    loadChildren: () => import('./modules/convenios/group-config/group-config.routes'),
    providers: [provideTranslocoScopes(SCOPE_GROUP_CONFIG)],
  },
  {
    path: 'employer/settings/leaves/leaves-management',
    loadChildren: () => import('./modules/settings/leaves-management/leaves-management.routes'),
    providers: [provideTranslocoScopes(SCOPE_LEAVES)],
  },
];
