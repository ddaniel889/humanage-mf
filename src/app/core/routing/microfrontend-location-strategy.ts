import {
  APP_BASE_HREF,
  LocationStrategy,
  PlatformLocation,
  LocationChangeListener,
} from '@angular/common';
import { EventEmitter, Injectable, Injector, inject } from '@angular/core';
import { Router, UrlHandlingStrategy } from '@angular/router';
import { CONFIG, MicrofrontendConfig } from '../config';
import { normalizeRoute } from './microfrontend-routing.utils';
import {
  HostNavigationChangeEvent,
  MicrofrontendHistoryRequestEvent,
  MicrofrontendNavigationRequestEvent,
} from './routing-events.model';

@Injectable()
export class MicrofrontendLocationStrategy extends LocationStrategy {
  private readonly config: MicrofrontendConfig = inject(CONFIG);
  private readonly _urlHandlingStrategy = inject(UrlHandlingStrategy);
  private readonly _platformLocation = inject(PlatformLocation);
  private readonly _injector = inject(Injector);

  private currentRoute = '/';
  private readonly _subject = new EventEmitter<unknown>();
  private readonly _baseHref: string;
  private _router?: Router;

  constructor() {
    super();
    const href = inject(APP_BASE_HREF, { optional: true }) ?? this._platformLocation.getBaseHrefFromDOM() ?? '/';
    this._baseHref = href;

    // Initialize with current hash path if using hash routing
    const currentHash = globalThis.location.hash;
    if (currentHash) {
      // Convert hash route to internal route format
      const hashRoute = currentHash.substring(1); // Remove the # symbol
      this.currentRoute = normalizeRoute(hashRoute);
    }

    // Listen to host navigation events
    this.setupHostCommunication();
  }

  override path(): string {
    return this.currentRoute;
  }

  // getState is delegated to the host. MF doesn't need getState.
  override getState(): unknown {
    return null;
  }

  override prepareExternalUrl(internal: string): string {
    return this._baseHref + internal;
  }

  override pushState(state: unknown, title: string, url: string, queryParams: string): void {
    // ALWAYS notify host - let HOST decide who should handle this
    const fullUrl = queryParams ? `${url}?${queryParams}` : url;
    this.notifyHostOfNavigation(fullUrl);
    // Do NOT update internal state yet - wait for host broadcast
  }

  override replaceState(state: unknown, title: string, url: string, queryParams: string): void {
    // ALWAYS notify host - let HOST decide who should handle this
    const fullUrl = queryParams ? `${url}?${queryParams}` : url;
    this.notifyHostOfNavigation(fullUrl);
    // Do NOT update internal state yet - wait for host broadcast
  }

  override forward(): void {
    this.requestHostNavigation('forward');
  }

  override back(): void {
    this.requestHostNavigation('back');
  }

  override historyGo(relativePosition: number): void {
    this.requestHostNavigation('go', relativePosition);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  override onPopState(fn: LocationChangeListener): void {}

  override getBaseHref(): string {
    return this._baseHref;
  }

  /**
   * Setup communication with host application
   * Centralized routing approach: Host decides, microfrontend reacts
   */
  private setupHostCommunication(): void {
    // Listen for host route changes (broadcasted to ALL microfrontends)
    globalThis.addEventListener(HostNavigationChangeEvent.eventType, (rawEvent: Event) => {
      const hostNavigationChange = rawEvent as HostNavigationChangeEvent;
      const hostRoute = hostNavigationChange.detail?.route;
      if (!hostRoute) {
        console.warn('Received hostNavigationChange event with no route');
        return;
      }
      // Convert string route to UrlTree for shouldProcessUrl
      const routerInstance = this.getRouter();
      const urlTree = routerInstance?.parseUrl(hostRoute);
      // Filter broadcasts: only process routes that belong to this microfrontend
      if (urlTree && this._urlHandlingStrategy.shouldProcessUrl(urlTree)) {
        this.processHostNavigationDecision(hostRoute);
      }
    });
  }

  /**
   * Notify host application of navigation request
   * Pure approach: Just tell host, don't decide anything
   */
  private notifyHostOfNavigation(microfrontendRoute: string): void {
    const normalizedMicrofrontendRoute = normalizeRoute(microfrontendRoute);
    const navigationRequestEvent = new MicrofrontendNavigationRequestEvent({
      microfrontend: this.config.name,
      route: normalizedMicrofrontendRoute,
      timestamp: Date.now(),
    });
    globalThis.dispatchEvent(navigationRequestEvent);
  }

  /**
   * Request host to handle navigation (back, forward, go)
   */
  private requestHostNavigation(historyAction: string, historyPosition?: number): void {
    const historyRequestEvent = new MicrofrontendHistoryRequestEvent({
      microfrontend: this.config.name,
      action: historyAction as 'back' | 'forward' | 'go',
      position: historyPosition,
      timestamp: Date.now(),
    });
    globalThis.dispatchEvent(historyRequestEvent);
  }

  /**
   * Process host navigation decision - THIS microfrontend should handle the route
   * This is called when host broadcasts and we determine we should handle it
   */
  private processHostNavigationDecision(hostRoute: string): void {
    const normalizedHostRoute = normalizeRoute(hostRoute);

    // Update internal state (this is what was missing in pushState/replaceState)
    this.currentRoute = normalizedHostRoute;

    // Use router to navigate to the correct route
    this.navigateToRoute(normalizedHostRoute);

    // Emit internal change to complete the Angular Router cycle
    this._subject.emit({ url: normalizedHostRoute, host: true });
  }

  /**
   * Get router instance lazily to avoid circular dependencies
   */
  private getRouter(): Router | null {
    if (!this._router) {
      try {
        this._router = this._injector.get(Router);
      } catch {
        console.warn('Router not available yet, will retry later');
        return null;
      }
    }
    return this._router;
  }

  /**
   * Navigate to a route using Angular router
   */
  private navigateToRoute(targetRoute: string): void {
    const routerInstance = this.getRouter();
    routerInstance?.navigateByUrl(targetRoute).catch(navigationError => {
      console.error('Navigation error:', navigationError);
    });
  }
}
