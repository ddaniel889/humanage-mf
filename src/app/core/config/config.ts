import { MicrofrontendConfig } from './microfrontend-config.interface';

/**
 * Microfrontend configuration values.
 * This is the single source of truth for the microfrontend's configuration.
 *
 * To add new configuration properties:
 * 1. Update the MicrofrontendConfig interface in microfrontend-config.interface.ts
 * 2. Add the new property value here
 */
export const config: MicrofrontendConfig = {
  name: 'humanage-leaves',
};
