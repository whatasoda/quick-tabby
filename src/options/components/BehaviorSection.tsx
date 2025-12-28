import { For, Show } from "solid-js";
import { css } from "../../../styled-system/css";
import type {
  Settings,
  ThumbnailQuality,
  DefaultMode,
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
  settingRowSubSetting: css({
    paddingLeft: "xl",
    background: "surfaceAlt",
  }),
  settingLabel: css({
    fontSize: "lg",
  }),
  settingDescription: css({
    fontSize: "12px",
    color: "text.secondary",
    marginTop: "xs",
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
  checkboxLabel: css({
    display: "flex",
    alignItems: "center",
    gap: "sm",
    cursor: "pointer",
    "& input": {
      width: "16px",
      height: "16px",
      cursor: "pointer",
    },
  }),
};

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
    <div class={styles.section}>
      <h2 class={styles.sectionTitle}>Behavior</h2>

      <div class={styles.settingRow}>
        <div>
          <div class={styles.settingLabel}>Preview Mode</div>
          <div class={styles.settingDescription}>
            Show enlarged thumbnail of selected tab
          </div>
        </div>
        <label class={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={props.settings.previewModeEnabled}
            onChange={(e) =>
              props.onUpdateSetting("previewModeEnabled", e.target.checked)
            }
          />
        </label>
      </div>

      <Show when={props.settings.previewModeEnabled}>
        <div class={`${styles.settingRow} ${styles.settingRowSubSetting}`}>
          <div>
            <div class={styles.settingLabel}>Thumbnail Quality</div>
            <div class={styles.settingDescription}>
              Higher quality uses more storage
            </div>
          </div>
          <div class={styles.radioGroup}>
            <For each={THUMBNAIL_OPTIONS}>
              {(quality) => (
                <label class={styles.radioOption}>
                  <input
                    type="radio"
                    name="thumbnailQuality"
                    checked={props.settings.thumbnailQuality === quality}
                    onChange={() =>
                      props.onUpdateSetting("thumbnailQuality", quality)
                    }
                  />
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </label>
              )}
            </For>
          </div>
        </div>
      </Show>

      <div class={styles.settingRow}>
        <div>
          <div class={styles.settingLabel}>Default Mode</div>
          <div class={styles.settingDescription}>
            Initial mode when opening the popup
          </div>
        </div>
        <div class={styles.radioGroup}>
          <For each={DEFAULT_MODE_OPTIONS}>
            {(option) => (
              <label class={styles.radioOption}>
                <input
                  type="radio"
                  name="defaultMode"
                  checked={props.settings.defaultMode === option.value}
                  onChange={() =>
                    props.onUpdateSetting("defaultMode", option.value)
                  }
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
