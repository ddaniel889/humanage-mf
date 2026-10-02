import { isDevMode, NgModule } from '@angular/core';
import { provideTransloco, TranslocoModule } from '@jsverse/transloco';
import { TranslocoLocaleModule, provideTranslocoLocale } from '@jsverse/transloco-locale';

@NgModule({
  exports: [TranslocoModule],
  imports: [TranslocoLocaleModule],
  providers: [
    provideTransloco({
      config: {
        availableLangs: [
          {
            id: 'es',
            label: 'Español',
          },
          {
            id: 'en',
            label: 'English',
          },
          {
            id: 'pt',
            label: 'Português',
          },
        ],
        defaultLang: 'es',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
    }),
    provideTranslocoLocale({
      langToLocaleMapping: {
        en: 'en-US',
        es: 'es-AR',
        pt: 'pt-BR',
      },
    }),
  ],
})
export class TranslocoRootModule {}
