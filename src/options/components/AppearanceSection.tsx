import { For } from "solid-js";
import type { PopupSize, Settings, ThemePreference } from "../../core/settings/settings-types";
import { formStyles, sectionStyles } from "./styles";

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
    <div class={sectionStyles.section}>
      <h2 class={sectionStyles.sectionTitle}>Appearance</h2>

      <div class={formStyles.settingRow}>
        <div>
          <div class={formStyles.settingLabel}>Theme</div>
        </div>
        <div class={formStyles.radioGroup}>
          <For each={THEME_OPTIONS}>
            {(option) => (
              <label class={formStyles.radioOption}>
                <input
                  type="radio"
                  name="themePreference"
                  checked={props.settings.themePreference === option.value}
                  onChange={() => props.onUpdateSetting("themePreference", option.value)}
                />
                {option.label}
              </label>
            )}
          </For>
        </div>
      </div>

      <div class={formStyles.settingRow}>
        <div>
          <div class={formStyles.settingLabel}>Popup Size</div>
        </div>
        <div class={formStyles.radioGroup}>
          <For each={SIZE_OPTIONS}>
            {(size) => (
              <label class={formStyles.radioOption}>
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
