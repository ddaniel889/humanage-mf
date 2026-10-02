import { InjectionToken } from '@angular/core';
import { MicrofrontendConfig } from './microfrontend-config.interface';

/**
 * Global configuration injection token for the microfrontend.
 *
 * This token provides access to the microfrontend's configuration throughout the application.
 * It should be provided in app.module.ts with the configuration values.
 *
 * Example usage in app.module.ts:
 * ```typescript
 * providers: [
 *   {
 *     provide: CONFIG,
 *     useValue: {
 *       name: 'humanage-leaves',
 *       // ... other config properties
 *     }
 *   }
 * ]
 * ```
 *
 * Example usage in a service or component:
 * ```typescript
 * constructor(@Inject(CONFIG) private config: MicrofrontendConfig) {
 *   console.log(this.config.name); // 'humanage-leaves'
 * }
 * ```
 */
export const CONFIG = new InjectionToken<MicrofrontendConfig>('microfrontend-config');
