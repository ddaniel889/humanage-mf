import { inject, Injectable } from '@angular/core';
import { UrlHandlingStrategy, UrlTree } from '@angular/router';
import { VALID_URL_PREFIXES } from './tokens';
import { normalizeRoute } from './microfrontend-routing.utils';

/**
 * UrlHandlingStrategy for microfrontend
 * Only allow the Angular Router to process URLs that belong to this microfrontend
 * This prevents the router from attempting to match host-only routes which would
 * otherwise trigger NG04002 when the microfrontend doesn't declare those routes.
 */
@Injectable()
export class MicrofrontendUrlHandlingStrategy implements UrlHandlingStrategy {
  private readonly validUrlPrefixes = inject<string[]>(VALID_URL_PREFIXES);
  private readonly ownedPrefixes: string[] = this.validUrlPrefixes.map(prefix => normalizeRoute(prefix));

  /**
   * Decide whether the router should process this URL.
   * We only process URLs that clearly belong to the microfrontend.
   */
  shouldProcessUrl(url: UrlTree): boolean {
    try {
      const route = normalizeRoute(url.toString());
      return this.ownedPrefixes.some(prefix => route.startsWith(prefix));
    } catch {
      // In doubt, don't process (safe default)
      return false;
    }
  }

  extract(url: UrlTree): UrlTree {
    return url;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  merge(newUrlTree: UrlTree, _rawUrl: UrlTree): UrlTree {
    return newUrlTree;
  }
}
