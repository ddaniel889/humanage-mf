import { InjectionToken } from '@angular/core';
import { routes } from '../../app.routes';

/**
 * Token that defines the valid URL routes this microfrontend can process.
 *
 * DEFAULT VALUE (Factory):
 * - Automatically calculated from app.routes by mapping route.path values
 *
 * OVERRIDABLE:
 * Any microfrontend can override this token if it needs different logic.
 * Example in app.module.ts:
 *
 *   providers: [
 *     { provide: VALID_URL_PREFIXES, useValue: ['custom/route1', 'custom/route2'] }
 *   ]
 *
 * USE CASE:
 * - MicrofrontendUrlHandlingStrategy uses it to decide which routes to process
 * - MicrofrontendLocationStrategy uses it to filter host broadcasts (only processes routes that belong to this MF)
 * - Prevents NG04002 errors by filtering routes that don't belong to this MF
 */
export const VALID_URL_PREFIXES = new InjectionToken<string[]>('valid-url-prefixes', {
  providedIn: 'root',
  factory: () => routes.map(route => route.path).filter((p): p is string => p !== undefined),
});
