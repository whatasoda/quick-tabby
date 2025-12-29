import { createSignal, For, Show } from "solid-js";
import { css } from "../../../styled-system/css";
import { DEFAULT_EXCLUSION_PATTERNS } from "../../core/settings/settings-defaults";
import type { Settings } from "../../core/settings/settings-types";
import { getPatternError } from "../../core/url-pattern";
import { t } from "../../shared/i18n/index.ts";
import { MSG } from "../../shared/i18n/message-keys.ts";
import { Button, Section } from "../../shared/ui";

const styles = {
  subsection: css({
    marginBottom: "24px",
    _last: {
      marginBottom: "0",
    },
  }),
  header: css({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  }),
  title: css({
    fontSize: "lg",
    color: "text.primary",
    fontWeight: "medium",
  }),
  description: css({
    fontSize: "12px",
    color: "text.secondary",
    marginBottom: "12px",
  }),
  patternList: css({
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "12px",
  }),
  patternItem: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 12px",
    borderRadius: "md",
    backgroundColor: "bg.muted",
    fontSize: "sm",
  }),
  patternCode: css({
    fontFamily: "mono",
    fontSize: "xs",
    color: "fg.muted",
  }),
  removeButton: css({
    color: "fg.muted",
    cursor: "pointer",
    padding: "2px 6px",
    borderRadius: "sm",
    _hover: {
      backgroundColor: "bg.subtle",
      color: "fg.error",
    },
  }),
  addForm: css({
    display: "flex",
    gap: "8px",
  }),
  input: css({
    flex: 1,
    padding: "8px 12px",
    borderRadius: "md",
    border: "1px solid",
    borderColor: "border.subtle",
    backgroundColor: "bg.canvas",
    color: "fg.default",
    fontSize: "sm",
    _focus: {
      outline: "none",
      borderColor: "border.active",
    },
  }),
  error: css({
    color: "fg.error",
    fontSize: "xs",
    marginTop: "8px",
  }),
  emptyList: css({
    padding: "12px",
    textAlign: "center",
    color: "text.secondary",
    fontSize: "sm",
    backgroundColor: "bg.muted",
    borderRadius: "md",
    marginBottom: "12px",
  }),
};

interface PatternListProps {
  title: string;
  description: string;
  patterns: string[];
  settingKey: "screenshotSkipPatterns" | "screenshotBlurPatterns";
  defaultPatterns: readonly string[];
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

function PatternList(props: PatternListProps) {
  const [newPattern, setNewPattern] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);

  function handleAdd() {
    const pattern = newPattern().trim();
    if (!pattern) return;

    const validationError = getPatternError(pattern);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (props.patterns.includes(pattern)) {
      setError(t(MSG.OPTIONS_PATTERN_EXISTS));
      return;
    }

    props.onUpdateSetting(props.settingKey, [...props.patterns, pattern]);
    setNewPattern("");
    setError(null);
  }

  function handleRemove(index: number) {
    props.onUpdateSetting(
      props.settingKey,
      props.patterns.filter((_, i) => i !== index),
    );
  }

  function handleResetDefaults() {
    props.onUpdateSetting(props.settingKey, [...props.defaultPatterns]);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div class={styles.subsection}>
      <div class={styles.header}>
        <span class={styles.title}>{props.title}</span>
        <Button variant="ghost" size="sm" onClick={handleResetDefaults}>
          {t(MSG.COMMON_RESET)}
        </Button>
      </div>

      <p class={styles.description}>{props.description}</p>

      <Show
        when={props.patterns.length > 0}
        fallback={<div class={styles.emptyList}>{t(MSG.OPTIONS_NO_PATTERNS)}</div>}
      >
        <div class={styles.patternList}>
          <For each={props.patterns}>
            {(pattern, index) => (
              <div class={styles.patternItem}>
                <code class={styles.patternCode}>{pattern}</code>
                <button
                  type="button"
                  class={styles.removeButton}
                  onClick={() => handleRemove(index())}
                  title={t(MSG.OPTIONS_REMOVE_PATTERN)}
                >
                  ×
                </button>
              </div>
            )}
          </For>
        </div>
      </Show>

      <div class={styles.addForm}>
        <input
          type="text"
          class={styles.input}
          value={newPattern()}
          onInput={(e) => {
            setNewPattern(e.currentTarget.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={t(MSG.OPTIONS_PATTERN_PLACEHOLDER)}
        />
        <Button variant="outline" size="sm" onClick={handleAdd}>
          {t(MSG.COMMON_ADD)}
        </Button>
      </div>

      <Show when={error()}>
        <div class={styles.error}>{error()}</div>
      </Show>
    </div>
  );
}

interface PrivacySectionProps {
  settings: Settings;
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export function PrivacySection(props: PrivacySectionProps) {
  return (
    <Section title={t(MSG.OPTIONS_PRIVACY)}>
      <PatternList
        title={t(MSG.OPTIONS_SKIP_SCREENSHOT)}
        description={t(MSG.OPTIONS_SKIP_SCREENSHOT_DESC)}
        patterns={props.settings.screenshotSkipPatterns}
        settingKey="screenshotSkipPatterns"
        defaultPatterns={DEFAULT_EXCLUSION_PATTERNS}
        onUpdateSetting={props.onUpdateSetting}
      />

      <PatternList
        title={t(MSG.OPTIONS_BLUR_SCREENSHOT)}
        description={t(MSG.OPTIONS_BLUR_SCREENSHOT_DESC)}
        patterns={props.settings.screenshotBlurPatterns}
        settingKey="screenshotBlurPatterns"
        defaultPatterns={[]}
        onUpdateSetting={props.onUpdateSetting}
      />
    </Section>
  );
}
