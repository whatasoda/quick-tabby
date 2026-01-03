import { For } from "solid-js";
import { css } from "../../../styled-system/css";
import type { MatchRange } from "../../core/search";

const styles = {
  highlight: css({
    background: "highlight",
    borderRadius: "2px",
    padding: "0 1px",
  }),
};

interface HighlightedTextProps {
  text: string;
  matches: MatchRange[];
  class?: string;
}

interface TextSegment {
  text: string;
  isHighlighted: boolean;
}

function getTextSegments(text: string, matches: MatchRange[]): TextSegment[] {
  if (matches.length === 0) {
    return [{ text, isHighlighted: false }];
  }

  // Sort and merge overlapping ranges
  const sortedMatches = [...matches].sort((a, b) => a.start - b.start);
  const mergedRanges: MatchRange[] = [];

  for (const range of sortedMatches) {
    const last = mergedRanges[mergedRanges.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      mergedRanges.push({ ...range });
    }
  }

  const segments: TextSegment[] = [];
  let currentIndex = 0;

  for (const range of mergedRanges) {
    // Add non-highlighted segment before this match
    if (currentIndex < range.start) {
      segments.push({
        text: text.slice(currentIndex, range.start),
        isHighlighted: false,
      });
    }
    // Add highlighted segment
    segments.push({
      text: text.slice(range.start, range.end),
      isHighlighted: true,
    });
    currentIndex = range.end;
  }

  // Add remaining non-highlighted text
  if (currentIndex < text.length) {
    segments.push({
      text: text.slice(currentIndex),
      isHighlighted: false,
    });
  }

  return segments;
}

export function HighlightedText(props: HighlightedTextProps) {
  const segments = () => getTextSegments(props.text, props.matches);

  return (
    <span class={props.class}>
      <For each={segments()}>
        {(segment) =>
          segment.isHighlighted ? (
            <mark class={styles.highlight}>{segment.text}</mark>
          ) : (
            segment.text
          )
        }
      </For>
    </span>
  );
}
