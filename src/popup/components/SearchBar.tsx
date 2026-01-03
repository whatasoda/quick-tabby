import { FiSearch, FiX } from "solid-icons/fi";
import { Show } from "solid-js";
import { css } from "../../../styled-system/css";
import { t } from "../../shared/i18n/index.ts";
import { MSG } from "../../shared/i18n/message-keys.ts";

const styles = {
  searchContainer: css({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderBottom: "1px solid token(colors.borderLight)",
    background: "surface",
  }),
  searchIcon: css({
    color: "text.secondary",
    flexShrink: 0,
  }),
  searchInput: css({
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "sm",
    color: "text.primary",
    _placeholder: {
      color: "text.muted",
    },
  }),
  clearButton: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "text.secondary",
    borderRadius: "sm",
    _hover: {
      background: "surfaceHover",
      color: "text.primary",
    },
  }),
};

interface SearchBarProps {
  value: string;
  onInput: (value: string) => void;
  onClear: () => void;
  onRef: (el: HTMLInputElement) => void;
}

export function SearchBar(props: SearchBarProps) {
  return (
    <div class={styles.searchContainer}>
      <FiSearch class={styles.searchIcon} size={16} />
      <input
        ref={props.onRef}
        type="text"
        class={styles.searchInput}
        placeholder={t(MSG.POPUP_SEARCH_PLACEHOLDER)}
        value={props.value}
        onInput={(e) => props.onInput(e.currentTarget.value)}
      />
      <Show when={props.value}>
        <button
          type="button"
          class={styles.clearButton}
          onClick={props.onClear}
          title="Clear search"
        >
          <FiX size={14} />
        </button>
      </Show>
    </div>
  );
}
