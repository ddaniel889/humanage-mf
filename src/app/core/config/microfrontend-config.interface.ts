/**
 * Global configuration interface for the microfrontend.
 * This interface defines all the configuration values that can be injected
 * throughout the application using the CONFIG token.
 */
export interface MicrofrontendConfig {
  /**
   * Unique identifier for this microfrontend.
   * Used in communication with the host application and for routing purposes.
   */
  name: string;

  // Add more configuration properties here as needed in the future
  // Example:
  // enableDebugMode?: boolean;
  // maxRetries?: number;
}
