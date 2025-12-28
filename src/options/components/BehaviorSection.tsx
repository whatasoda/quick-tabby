import { Show } from "solid-js";
import type { DefaultMode, Settings, ThumbnailQuality } from "../../core/settings/settings-types";
import { Checkbox, FormField, RadioGroup, type RadioOption, Section } from "../../shared/ui";

const THUMBNAIL_OPTIONS: RadioOption<ThumbnailQuality>[] = [
  { value: "standard", label: "Standard" },
  { value: "high", label: "High" },
  { value: "ultra", label: "Ultra" },
];

const DEFAULT_MODE_OPTIONS: RadioOption<DefaultMode>[] = [
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
    <Section title="Behavior">
      <FormField label="Preview Mode" description="Show enlarged thumbnail of selected tab">
        <Checkbox
          checked={props.settings.previewModeEnabled}
          onChange={(checked) => props.onUpdateSetting("previewModeEnabled", checked)}
        />
      </FormField>

      <Show when={props.settings.previewModeEnabled}>
        <FormField
          label="Thumbnail Quality"
          description="Higher quality uses more storage"
          indent="sub"
        >
          <RadioGroup
            name="thumbnailQuality"
            options={THUMBNAIL_OPTIONS}
            value={props.settings.thumbnailQuality}
            onChange={(value) => props.onUpdateSetting("thumbnailQuality", value)}
          />
        </FormField>
      </Show>

      <FormField label="Default Mode" description="Initial mode when opening the popup">
        <RadioGroup
          name="defaultMode"
          options={DEFAULT_MODE_OPTIONS}
          value={props.settings.defaultMode}
          onChange={(value) => props.onUpdateSetting("defaultMode", value)}
        />
      </FormField>
    </Section>
  );
}
