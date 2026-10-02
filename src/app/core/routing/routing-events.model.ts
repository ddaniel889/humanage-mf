/**
 * Details for host navigation change events broadcasted to microfrontends.
 */
export interface HostNavigationChangeDetail {
  route: string;
  timestamp: number;
}

/**
 * Details for navigation requests from microfrontends to the host.
 */
export interface MicrofrontendNavigationRequestDetail {
  route: string;
  microfrontend: string;
  timestamp: number;
}

/**
 * Details for history manipulation requests from microfrontends.
 */
export interface MicrofrontendHistoryRequestDetail {
  microfrontend: string;
  action: 'back' | 'forward' | 'go';
  position?: number;
  timestamp: number;
}

/**
 * Custom events for microfrontend communication.
 * These events enable communication between the host application and microfrontends
 * for coordinated routing and navigation management.
 */
export class HostNavigationChangeEvent extends CustomEvent<HostNavigationChangeDetail> {
  static readonly eventType = 'host-navigation-change';
  constructor(detail: HostNavigationChangeDetail) {
    super(HostNavigationChangeEvent.eventType, { detail });
  }
}
export class MicrofrontendNavigationRequestEvent extends CustomEvent<MicrofrontendNavigationRequestDetail> {
  static readonly eventType = 'microfrontend-navigation-request';
  constructor(detail: MicrofrontendNavigationRequestDetail) {
    super(MicrofrontendNavigationRequestEvent.eventType, { detail });
  }
}
export class MicrofrontendHistoryRequestEvent extends CustomEvent<MicrofrontendHistoryRequestDetail> {
  static readonly eventType = 'microfrontend-history-request';
  constructor(detail: MicrofrontendHistoryRequestDetail) {
    super(MicrofrontendHistoryRequestEvent.eventType, { detail });
  }
}
