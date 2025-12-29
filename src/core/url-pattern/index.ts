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
  type ParsedPattern,
  parsePattern,
} from "./url-pattern-matcher";
