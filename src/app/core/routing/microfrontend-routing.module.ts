import { NgModule, ModuleWithProviders } from '@angular/core';
import {
  RouterModule,
  Routes,
  UrlHandlingStrategy,
  ExtraOptions,
  NoPreloading
} from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { MicrofrontendLocationStrategy } from './microfrontend-location-strategy';
import { MicrofrontendUrlHandlingStrategy } from './microfrontend-url-handling.strategy';

/**
 * MicrofrontendRoutingModule
 *
 * Provides centralized routing for microfrontends without importing RouterModule.
 * Based on the pattern from:
 * https://medium.com/@rairavi001/centralised-routing-strategy-for-angular-and-react-micro-frontends-8a514c6b10ab
 *
 * Key features:
 * - Only exports RouterModule (doesn't import it)
 * - Uses RouterModule.forRoot() internally but extracts providers manually
 * - Integrates custom LocationStrategy and UrlHandlingStrategy
 * - Maintains bindToComponentInputs functionality
 *
 * This approach avoids the complexity of manually recreating all Angular Router
 * internal services while still not importing RouterModule directly.
 */
@NgModule({
  exports: [RouterModule]
  // Note: NO imports of RouterModule - we provide all routing services manually
})
export class MicrofrontendRoutingModule {
  static withRoutes(routes: Routes, config?: ExtraOptions): ModuleWithProviders<MicrofrontendRoutingModule> {
    const routerConfig: ExtraOptions = {
      useHash: false,
      bindToComponentInputs: true,
      enableTracing: false,
      preloadingStrategy: NoPreloading,
      ...config
    };

    // Extract providers from RouterModule.forRoot but don't import the module
    const routerModuleResult = RouterModule.forRoot(routes, routerConfig);
    const routerProviders = routerModuleResult.providers || [];

    return {
      ngModule: MicrofrontendRoutingModule,
      providers: [
        // Get all Angular Router providers (including bindToComponentInputs support)
        ...routerProviders,

        // Override with microfrontend-specific strategies
        {
          provide: LocationStrategy,
          useClass: MicrofrontendLocationStrategy
        },
        {
          provide: UrlHandlingStrategy,
          useClass: MicrofrontendUrlHandlingStrategy
        }
      ]
    };
  }
}
