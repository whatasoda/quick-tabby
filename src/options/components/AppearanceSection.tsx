import { For } from "solid-js";
import { css } from "../../../styled-system/css";
import type {
  Settings,
  ThemePreference,
  PopupSize,
} from "../../core/settings/settings-types";

const styles = {
  section: css({
    background: "background",
    borderRadius: "xl",
    padding: "lg",
    marginBottom: "lg",
    boxShadow: "sm",
  }),
  sectionTitle: css({
    fontSize: "lg",
    fontWeight: 600,
    color: "text.secondary",
    margin: "0 0 12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }),
  settingRow: css({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid token(colors.borderLighter)",
    _last: {
      borderBottom: "none",
    },
  }),
  settingLabel: css({
    fontSize: "lg",
  }),
  radioGroup: css({
    display: "flex",
    gap: "sm",
  }),
  radioOption: css({
    display: "flex",
    alignItems: "center",
    gap: "xs",
    cursor: "pointer",
  }),
};

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const SIZE_OPTIONS: PopupSize[] = ["small", "medium", "large"];

interface AppearanceSectionProps {
  settings: Settings;
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export function AppearanceSection(props: AppearanceSectionProps) {
  return (
    <div class={styles.section}>
      <h2 class={styles.sectionTitle}>Appearance</h2>

      <div class={styles.settingRow}>
        <div>
          <div class={styles.settingLabel}>Theme</div>
        </div>
        <div class={styles.radioGroup}>
          <For each={THEME_OPTIONS}>
            {(option) => (
              <label class={styles.radioOption}>
                <input
                  type="radio"
                  name="themePreference"
                  checked={props.settings.themePreference === option.value}
                  onChange={() =>
                    props.onUpdateSetting("themePreference", option.value)
                  }
                />
                {option.label}
              </label>
            )}
          </For>
        </div>
      </div>

      <div class={styles.settingRow}>
        <div>
          <div class={styles.settingLabel}>Popup Size</div>
        </div>
        <div class={styles.radioGroup}>
          <For each={SIZE_OPTIONS}>
            {(size) => (
              <label class={styles.radioOption}>
                <input
                  type="radio"
                  name="popupSize"
                  checked={props.settings.popupSize === size}
                  onChange={() => props.onUpdateSetting("popupSize", size)}
                />
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </label>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
