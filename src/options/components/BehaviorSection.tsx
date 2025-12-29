import { Show } from "solid-js";
import type { DefaultMode, Settings, ThumbnailQuality } from "../../core/settings/settings-types";
import { t } from "../../shared/i18n/index.ts";
import { MSG } from "../../shared/i18n/message-keys.ts";
import { Checkbox, FormField, RadioGroup, type RadioOption, Section } from "../../shared/ui";

function getThumbnailOptions(): RadioOption<ThumbnailQuality>[] {
  return [
    { value: "standard", label: t(MSG.OPTIONS_QUALITY_STANDARD) },
    { value: "high", label: t(MSG.OPTIONS_QUALITY_HIGH) },
    { value: "ultra", label: t(MSG.OPTIONS_QUALITY_ULTRA) },
  ];
}

function getDefaultModeOptions(): RadioOption<DefaultMode>[] {
  return [
    { value: "lastUsed", label: t(MSG.OPTIONS_MODE_LAST_USED) },
    { value: "all", label: t(MSG.OPTIONS_MODE_ALL) },
    { value: "currentWindow", label: t(MSG.OPTIONS_MODE_CURRENT) },
  ];
}

interface BehaviorSectionProps {
  settings: Settings;
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export function BehaviorSection(props: BehaviorSectionProps) {
  return (
    <Section title={t(MSG.OPTIONS_BEHAVIOR)}>
      <FormField label={t(MSG.OPTIONS_PREVIEW_MODE)} description={t(MSG.OPTIONS_PREVIEW_MODE_DESC)}>
        <Checkbox
          checked={props.settings.previewModeEnabled}
          onChange={(checked) => props.onUpdateSetting("previewModeEnabled", checked)}
        />
      </FormField>

      <Show when={props.settings.previewModeEnabled}>
        <FormField
          label={t(MSG.OPTIONS_THUMBNAIL_QUALITY)}
          description={t(MSG.OPTIONS_THUMBNAIL_QUALITY_DESC)}
          indent="sub"
        >
          <RadioGroup
            name="thumbnailQuality"
            options={getThumbnailOptions()}
            value={props.settings.thumbnailQuality}
            onChange={(value) => props.onUpdateSetting("thumbnailQuality", value)}
          />
        </FormField>

        <FormField
          label={t(MSG.OPTIONS_BLUR_THUMBNAILS)}
          description={t(MSG.OPTIONS_BLUR_THUMBNAILS_DESC)}
          indent="sub"
        >
          <Checkbox
            checked={props.settings.thumbnailBlurEnabled}
            onChange={(checked) => props.onUpdateSetting("thumbnailBlurEnabled", checked)}
          />
        </FormField>
      </Show>

      <FormField label={t(MSG.OPTIONS_DEFAULT_MODE)} description={t(MSG.OPTIONS_DEFAULT_MODE_DESC)}>
        <RadioGroup
          name="defaultMode"
          options={getDefaultModeOptions()}
          value={props.settings.defaultMode}
          onChange={(value) => props.onUpdateSetting("defaultMode", value)}
        />
      </FormField>
    </Section>
  );
}
