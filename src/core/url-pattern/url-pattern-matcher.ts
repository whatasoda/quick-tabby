/**
 * URL Pattern Matching
 *
 * Pure functions for matching URLs against Chrome extension match patterns.
 * Pattern format: <scheme>://<host>/<path>
 *
 * @example
 * - "*://*.example.com/*" - All pages on example.com and subdomains
 * - "chrome://*" - All Chrome internal pages
 * - "https://mail.google.com/*" - Gmail specifically
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Parsed match pattern components
 */
export interface ParsedPattern {
  scheme: string;
  host: string;
  path: string;
}

// =============================================================================
// Constants
// =============================================================================

const VALID_SCHEMES = [
  "*",
  "http",
  "https",
  "ftp",
  "file",
  "chrome",
  "chrome-extension",
  "edge",
  "about",
] as const;

/**
 * Regex to validate Chrome extension match pattern format
 * Handles both standard URL patterns (scheme://host/path) and special schemes (about:*)
 */
const MATCH_PATTERN_REGEX =
  /^(\*|https?|ftp|file|chrome|chrome-extension|edge):\/\/(\*|\*\.[^/]+|[^/*]+)?(\/.*)?$/;

/**
 * Regex for special schemes that don't use :// (like about:blank)
 */
const SPECIAL_SCHEME_REGEX = /^(about):(.*)$/;

// =============================================================================
// Pattern Parsing
// =============================================================================

/**
 * Parse a Chrome extension match pattern into components
 */
export function parsePattern(pattern: string): ParsedPattern | null {
  // Try standard URL format first (scheme://host/path)
  const standardMatch = pattern.match(/^([^:]+):\/\/([^/]*)(.*)$/);
  if (standardMatch) {
    const [, scheme, host, path] = standardMatch;
    return {
      scheme: scheme ?? "",
      host: host ?? "",
      path: path || "/",
    };
  }

  // Try special scheme format (about:blank, etc.)
  const specialMatch = pattern.match(SPECIAL_SCHEME_REGEX);
  if (specialMatch) {
    const [, scheme, rest] = specialMatch;
    return {
      scheme: scheme ?? "",
      host: "",
      path: rest ?? "",
    };
  }

  return null;
}

/**
 * Validate if a pattern string is syntactically correct
 */
export function isValidPattern(pattern: string): boolean {
  if (!pattern.trim()) return false;
  // Check standard format or special scheme format
  return MATCH_PATTERN_REGEX.test(pattern) || SPECIAL_SCHEME_REGEX.test(pattern);
}

/**
 * Get a human-readable description of pattern validation error
 */
export function getPatternError(pattern: string): string | null {
  if (!pattern.trim()) {
    return "Pattern cannot be empty";
  }

  const parsed = parsePattern(pattern);
  if (!parsed) {
    return "Pattern must include scheme (e.g., *://, https://, about:)";
  }

  const { scheme } = parsed;
  if (!VALID_SCHEMES.includes(scheme as (typeof VALID_SCHEMES)[number])) {
    return `Invalid scheme: ${scheme}. Valid schemes: ${VALID_SCHEMES.join(", ")}`;
  }

  if (!isValidPattern(pattern)) {
    return "Invalid pattern format. Use format: scheme://host/path (e.g., *://*.example.com/*) or about:*";
  }

  return null;
}

// =============================================================================
// Pattern Compilation
// =============================================================================

/**
 * Compile a pattern string into a regex for efficient matching
 */
export function compilePattern(pattern: string): RegExp | null {
  if (!isValidPattern(pattern)) return null;

  // Escape regex special chars except *
  let regexStr = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");

  // Convert * to .* for wildcard matching
  regexStr = regexStr.replace(/\*/g, ".*");

  return new RegExp(`^${regexStr}$`, "i");
}

// =============================================================================
// Pattern Matching
// =============================================================================

/**
 * Check if a URL matches a single pattern
 */
export function matchesPattern(url: string, pattern: string): boolean {
  const regex = compilePattern(pattern);
  if (!regex) return false;
  return regex.test(url);
}

/**
 * Check if a URL matches any pattern in a list
 */
export function matchesAnyPattern(url: string, patterns: string[]): boolean {
  return patterns.some((pattern) => matchesPattern(url, pattern));
}
