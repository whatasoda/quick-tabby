import type { RetryConfig } from "./retry-config.ts";

/**
 * Calculate the delay before the next retry attempt using exponential backoff.
 *
 * @param attempt - The current attempt number (0-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds before the next retry
 */
export function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelayMs * config.backoffMultiplier ** attempt;
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Error messages that indicate Chrome runtime messaging failures
 * that may be recoverable after a retry (e.g., service worker restart).
 */
const RETRYABLE_ERROR_PATTERNS = [
  "receiving end does not exist",
  "extension context invalidated",
  "message port closed",
  "could not establish connection",
] as const;

/**
 * Determine if an error is retryable.
 * Errors related to Chrome extension messaging failures (service worker termination)
 * are considered retryable.
 *
 * @param error - The error to check
 * @returns true if the error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return RETRYABLE_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

/**
 * Create a promise that resolves after a delay.
 *
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
