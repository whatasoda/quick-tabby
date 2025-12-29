import type { PopupSize, Settings, ThemePreference } from "../../core/settings/settings-types";
import { t } from "../../shared/i18n/index.ts";
import { MSG } from "../../shared/i18n/message-keys.ts";
import { FormField, RadioGroup, type RadioOption, Section } from "../../shared/ui";

function getThemeOptions(): RadioOption<ThemePreference>[] {
  return [
    { value: "auto", label: t(MSG.OPTIONS_THEME_AUTO) },
    { value: "light", label: t(MSG.OPTIONS_THEME_LIGHT) },
    { value: "dark", label: t(MSG.OPTIONS_THEME_DARK) },
  ];
}

function getSizeOptions(): RadioOption<PopupSize>[] {
  return [
    { value: "small", label: t(MSG.OPTIONS_SIZE_SMALL) },
    { value: "medium", label: t(MSG.OPTIONS_SIZE_MEDIUM) },
    { value: "large", label: t(MSG.OPTIONS_SIZE_LARGE) },
  ];
}

interface AppearanceSectionProps {
  settings: Settings;
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export function AppearanceSection(props: AppearanceSectionProps) {
  return (
    <Section title={t(MSG.OPTIONS_APPEARANCE)}>
      <FormField label={t(MSG.OPTIONS_THEME)}>
        <RadioGroup
          name="themePreference"
          options={getThemeOptions()}
          value={props.settings.themePreference}
          onChange={(value) => props.onUpdateSetting("themePreference", value)}
        />
      </FormField>

      <FormField label={t(MSG.OPTIONS_POPUP_SIZE)}>
        <RadioGroup
          name="popupSize"
          options={getSizeOptions()}
          value={props.settings.popupSize}
          onChange={(value) => props.onUpdateSetting("popupSize", value)}
        />
      </FormField>
    </Section>
  );
}
