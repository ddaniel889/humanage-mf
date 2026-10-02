/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData, DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { App } from './app';
import { RouterOutlet } from '@angular/router';
import { routes } from './app.routes';
import { createCustomElement } from '@angular/elements';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TokenInterceptor } from './core/auth/token-interceptor';
import { TranslocoRootModule } from './core/transloco/transloco-root.module';
import { CONFIG, config } from './core/config';
import localeEs from '@angular/common/locales/es';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  NativeDateAdapter,
} from '@angular/material/core';
import { MAT_SELECT_CONFIG } from '@angular/material/select';
import { MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS } from '@angular/material/slide-toggle';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';
import { TranslocoPaginatorIntl } from './core/transloco/transloco-paginator-intl.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MicrofrontendRoutingModule } from './core/routing/microfrontend-routing.module';
import { MAT_BOTTOM_SHEET_DEFAULT_OPTIONS } from '@angular/material/bottom-sheet';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
registerLocaleData(localeEs);

@NgModule({
  declarations: [App],
  imports: [
    CommonModule,
    BrowserModule,
    RouterOutlet,
    MicrofrontendRoutingModule.withRoutes(routes, { useHash: true, bindToComponentInputs: true }),
    TranslocoRootModule,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideTranslocoMessageformat(),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: CONFIG, useValue: config },
    { provide: MatPaginatorIntl, useClass: TranslocoPaginatorIntl },
    // TODO: Verificar. App legacy utiliza MomentDateAdapter, pero no está disponible en Angular Material v20
    { provide: MAT_DATE_LOCALE, useValue: 'es-AR' },
    { provide: DateAdapter, useClass: NativeDateAdapter },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: { dateInput: 'DD/MM/YYYY' },
        display: {
          dateInput: 'DD/MM/YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
    DatePipe,
    { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
    { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { panelClass: 'mf-hl-tailwind-scope' } },
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: { tooltipClass: 'mf-hl-tailwind-scope' } },
    { provide: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, useValue: { panelClass: 'mf-hl-tailwind-scope' } },
  ],
  bootstrap: [],
})
export class AppModule implements DoBootstrap {
  constructor(private readonly injector: Injector) {}

  ngDoBootstrap(appRef: ApplicationRef) {
    const ce = createCustomElement(App, { injector: this.injector });
    customElements.define('mf-hl-root', ce);

    // Uncomment the following line to bootstrap the app and run it by itself outside the host app
    // appRef.bootstrap(App);
  }
}
