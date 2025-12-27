/**
 * MRU (Most Recently Used) state types
 *
 * These types define the structure of MRU tracking data,
 * which maintains the order of recently accessed tabs.
 */

/**
 * Represents the MRU state for tab tracking
 */
export interface MRUState {
  /** Global MRU list across all windows */
  readonly global: readonly number[];
  /** Per-window MRU lists keyed by window ID */
  readonly byWindow: Readonly<Record<number, readonly number[]>>;
}

/**
 * Empty MRU state for initialization
 */
export const EMPTY_MRU_STATE: MRUState = {
  global: [],
  byWindow: {},
};

/**
 * Configuration for MRU operations
 */
export interface MRUConfig {
  /** Maximum number of tabs to track in MRU lists */
  maxSize: number;
}

/**
 * Default MRU configuration
 */
export const DEFAULT_MRU_CONFIG: MRUConfig = {
  maxSize: 50,
};
