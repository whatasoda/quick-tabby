/**
 * Configuration for retry behavior with exponential backoff
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (including the initial attempt) */
  maxAttempts: number;
  /** Base delay in milliseconds before first retry */
  baseDelayMs: number;
  /** Maximum delay in milliseconds between retries */
  maxDelayMs: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 * - 3 attempts total
 * - Starting with 100ms delay
 * - Capped at 2000ms
 * - Doubling each time
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 100,
  maxDelayMs: 2000,
  backoffMultiplier: 2,
};
