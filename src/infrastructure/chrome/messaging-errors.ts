/**
 * Error codes for messaging failures
 */
export type MessagingErrorCode =
  | "SERVICE_WORKER_TERMINATED"
  | "CONNECTION_CLOSED"
  | "RESPONSE_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

/**
 * Custom error class for messaging failures with typed error codes
 */
export class MessagingError extends Error {
  public readonly code: MessagingErrorCode;

  constructor(message: string, code: MessagingErrorCode, cause?: unknown) {
    super(message, { cause });
    this.name = "MessagingError";
    this.code = code;
  }
}

/**
 * Error message patterns indicating service worker termination
 */
const SERVICE_WORKER_ERROR_PATTERNS = [
  "receiving end does not exist",
  "extension context invalidated",
  "message port closed",
  "could not establish connection",
] as const;

/**
 * Determine if an error is caused by service worker termination.
 *
 * @param error - The error to check
 * @returns true if the error indicates service worker termination
 */
export function isServiceWorkerError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return SERVICE_WORKER_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

/**
 * Classify an error and return the appropriate MessagingErrorCode.
 *
 * @param error - The error to classify
 * @returns The classified error code
 */
export function classifyError(error: unknown): MessagingErrorCode {
  if (isServiceWorkerError(error)) {
    return "SERVICE_WORKER_TERMINATED";
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("timeout")) {
      return "TIMEOUT";
    }
    if (message.includes("disconnected") || message.includes("closed")) {
      return "CONNECTION_CLOSED";
    }
  }

  return "UNKNOWN";
}

/**
 * Create a MessagingError from an unknown error.
 *
 * @param error - The original error
 * @param fallbackMessage - Message to use if error has no message
 * @returns A typed MessagingError
 */
export function toMessagingError(
  error: unknown,
  fallbackMessage = "Messaging failed",
): MessagingError {
  const code = classifyError(error);
  const message = error instanceof Error ? error.message : fallbackMessage;
  return new MessagingError(message, code, error);
}
