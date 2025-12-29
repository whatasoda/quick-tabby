import { createSignal, For, Show } from "solid-js";
import { css } from "../../../styled-system/css";
import { DEFAULT_EXCLUSION_PATTERNS } from "../../core/settings/settings-defaults";
import type { Settings } from "../../core/settings/settings-types";
import { getPatternError } from "../../core/url-pattern";
import { Button, FormField, Section } from "../../shared/ui";

const styles = {
  patternInput: css({
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
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
    marginBottom: "8px",
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
  actions: css({
    display: "flex",
    gap: "8px",
  }),
};

interface PrivacySectionProps {
  settings: Settings;
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export function PrivacySection(props: PrivacySectionProps) {
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

    // Check for duplicates
    if (props.settings.screenshotExclusionPatterns.includes(pattern)) {
      setError("This pattern already exists");
      return;
    }

    props.onUpdateSetting("screenshotExclusionPatterns", [
      ...props.settings.screenshotExclusionPatterns,
      pattern,
    ]);
    setNewPattern("");
    setError(null);
  }

  function handleRemove(index: number) {
    props.onUpdateSetting(
      "screenshotExclusionPatterns",
      props.settings.screenshotExclusionPatterns.filter((_, i) => i !== index),
    );
  }

  function handleResetDefaults() {
    props.onUpdateSetting("screenshotExclusionPatterns", [...DEFAULT_EXCLUSION_PATTERNS]);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <Section title="Privacy">
      <FormField
        label="Screenshot Exclusion Patterns"
        description="URLs matching these patterns will not have screenshots captured. Use patterns like *://*.bank.com/* or chrome://*"
      >
        <div class={styles.patternInput}>
          <input
            type="text"
            class={styles.input}
            value={newPattern()}
            onInput={(e) => {
              setNewPattern(e.currentTarget.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g., *://*.bank.com/*"
          />
          <Button variant="outline" size="sm" onClick={handleAdd}>
            Add
          </Button>
        </div>

        <Show when={error()}>
          <div class={styles.error}>{error()}</div>
        </Show>

        <div class={styles.patternList}>
          <For each={props.settings.screenshotExclusionPatterns}>
            {(pattern, index) => (
              <div class={styles.patternItem}>
                <code class={styles.patternCode}>{pattern}</code>
                <button
                  type="button"
                  class={styles.removeButton}
                  onClick={() => handleRemove(index())}
                  title="Remove pattern"
                >
                  x
                </button>
              </div>
            )}
          </For>
        </div>

        <div class={styles.actions}>
          <Button variant="ghost" size="sm" onClick={handleResetDefaults}>
            Reset to Defaults
          </Button>
        </div>
      </FormField>
    </Section>
  );
}
