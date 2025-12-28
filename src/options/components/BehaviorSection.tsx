import { For, Show } from "solid-js";
import type { DefaultMode, Settings, ThumbnailQuality } from "../../core/settings/settings-types";
import { formStyles, sectionStyles } from "./styles";

const THUMBNAIL_OPTIONS: ThumbnailQuality[] = ["standard", "high", "ultra"];

const DEFAULT_MODE_OPTIONS: { value: DefaultMode; label: string }[] = [
  { value: "lastUsed", label: "Last Used" },
  { value: "all", label: "All Windows" },
  { value: "currentWindow", label: "Current Window" },
];

interface BehaviorSectionProps {
  settings: Settings;
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export function BehaviorSection(props: BehaviorSectionProps) {
  return (
    <div class={sectionStyles.section}>
      <h2 class={sectionStyles.sectionTitle}>Behavior</h2>

      <div class={formStyles.settingRow}>
        <div>
          <div class={formStyles.settingLabel}>Preview Mode</div>
          <div class={formStyles.settingDescription}>Show enlarged thumbnail of selected tab</div>
        </div>
        <label class={formStyles.checkboxLabel}>
          <input
            type="checkbox"
            checked={props.settings.previewModeEnabled}
            onChange={(e) => props.onUpdateSetting("previewModeEnabled", e.target.checked)}
          />
        </label>
      </div>

      <Show when={props.settings.previewModeEnabled}>
        <div class={`${formStyles.settingRow} ${formStyles.settingRowSubSetting}`}>
          <div>
            <div class={formStyles.settingLabel}>Thumbnail Quality</div>
            <div class={formStyles.settingDescription}>Higher quality uses more storage</div>
          </div>
          <div class={formStyles.radioGroup}>
            <For each={THUMBNAIL_OPTIONS}>
              {(quality) => (
                <label class={formStyles.radioOption}>
                  <input
                    type="radio"
                    name="thumbnailQuality"
                    checked={props.settings.thumbnailQuality === quality}
                    onChange={() => props.onUpdateSetting("thumbnailQuality", quality)}
                  />
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </label>
              )}
            </For>
          </div>
        </div>
      </Show>

      <div class={formStyles.settingRow}>
        <div>
          <div class={formStyles.settingLabel}>Default Mode</div>
          <div class={formStyles.settingDescription}>Initial mode when opening the popup</div>
        </div>
        <div class={formStyles.radioGroup}>
          <For each={DEFAULT_MODE_OPTIONS}>
            {(option) => (
              <label class={formStyles.radioOption}>
                <input
                  type="radio"
                  name="defaultMode"
                  checked={props.settings.defaultMode === option.value}
                  onChange={() => props.onUpdateSetting("defaultMode", option.value)}
                />
                {option.label}
              </label>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
