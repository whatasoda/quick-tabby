/**
 * Type guards for IndexedDB operations
 *
 * These functions eliminate the need for type assertions when working with
 * IndexedDB event handlers and request results.
 */

import type { StoredThumbnail } from "./types.ts";

/**
 * Type guard to check if an EventTarget is an IDBOpenDBRequest
 */
export function isIDBOpenDBRequest(target: EventTarget | null): target is IDBOpenDBRequest {
  return (
    target !== null &&
    typeof target === "object" &&
    "result" in target &&
    "onupgradeneeded" in target
  );
}

/**
 * Type guard to check if an EventTarget is an IDBRequest
 */
export function isIDBRequest<T>(target: EventTarget | null): target is IDBRequest<T> {
  return (
    target !== null &&
    typeof target === "object" &&
    "result" in target &&
    "onsuccess" in target &&
    "onerror" in target
  );
}

/**
 * Type guard to check if a value is an IDBCursorWithValue
 */
export function isIDBCursorWithValue(value: unknown): value is IDBCursorWithValue {
  return (
    value !== null &&
    typeof value === "object" &&
    "continue" in value &&
    "delete" in value &&
    "value" in value
  );
}

/**
 * Type guard to check if a value is a StoredThumbnail
 */
export function isStoredThumbnail(value: unknown): value is StoredThumbnail {
  return (
    value !== null &&
    typeof value === "object" &&
    "tabId" in value &&
    "dataUrl" in value &&
    "capturedAt" in value &&
    typeof (value as StoredThumbnail).tabId === "number" &&
    typeof (value as StoredThumbnail).dataUrl === "string" &&
    typeof (value as StoredThumbnail).capturedAt === "number"
  );
}
