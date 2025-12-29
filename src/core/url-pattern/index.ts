/**
 * URL Pattern Module
 *
 * Provides Chrome extension match pattern matching for URL filtering.
 */

export {
  compilePattern,
  getPatternError,
  isValidPattern,
  matchesAnyPattern,
  matchesPattern,
  parsePattern,
  type ParsedPattern,
} from "./url-pattern-matcher";
