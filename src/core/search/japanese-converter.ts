/**
 * Japanese text conversion utilities
 *
 * Pure functions for bidirectional Romaji <-> Hiragana/Katakana conversion
 */
import { toHiragana, toKatakana, toRomaji } from "wanakana";

export interface QueryVariants {
  original: string;
  hiragana: string | null;
  katakana: string | null;
  romaji: string | null;
}

/**
 * Check if string contains Japanese characters (hiragana, katakana, or kanji)
 */
export function containsJapanese(str: string): boolean {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(str);
}

/**
 * Check if string contains ASCII letters (romaji)
 */
export function containsRomaji(str: string): boolean {
  return /[a-zA-Z]/.test(str);
}

/**
 * Generate search query variants for bidirectional Japanese/Romaji search
 *
 * @param query - Original search query
 * @returns Object with original and converted variants (null if conversion not applicable)
 */
export function generateQueryVariants(query: string): QueryVariants {
  const trimmed = query.trim();

  if (!trimmed) {
    return { original: trimmed, hiragana: null, katakana: null, romaji: null };
  }

  const hasJapanese = containsJapanese(trimmed);
  const hasRomaji = containsRomaji(trimmed);

  let hiragana: string | null = null;
  let katakana: string | null = null;
  let romaji: string | null = null;

  if (hasRomaji && !hasJapanese) {
    // Pure romaji input: convert to both hiragana and katakana
    hiragana = toHiragana(trimmed);
    katakana = toKatakana(trimmed);
  } else if (hasJapanese) {
    // Contains Japanese: convert to romaji
    romaji = toRomaji(trimmed);
  }

  return { original: trimmed, hiragana, katakana, romaji };
}

/**
 * Get all non-null query variants as an array
 */
export function getActiveVariants(variants: QueryVariants): string[] {
  const result: string[] = [variants.original];

  if (variants.hiragana && variants.hiragana !== variants.original) {
    result.push(variants.hiragana);
  }
  if (variants.katakana && variants.katakana !== variants.original) {
    result.push(variants.katakana);
  }
  if (variants.romaji && variants.romaji !== variants.original) {
    result.push(variants.romaji);
  }

  return result;
}
