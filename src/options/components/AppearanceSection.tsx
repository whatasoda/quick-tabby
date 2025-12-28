import type { PopupSize, Settings, ThemePreference } from "../../core/settings/settings-types";
import {
  FormField,
  RadioGroup,
  Section,
  type RadioOption,
} from "../../shared/ui";

const THEME_OPTIONS: RadioOption<ThemePreference>[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const SIZE_OPTIONS: RadioOption<PopupSize>[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

interface AppearanceSectionProps {
  settings: Settings;
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export function AppearanceSection(props: AppearanceSectionProps) {
  return (
    <Section title="Appearance">
      <FormField label="Theme">
        <RadioGroup
          name="themePreference"
          options={THEME_OPTIONS}
          value={props.settings.themePreference}
          onChange={(value) => props.onUpdateSetting("themePreference", value)}
        />
      </FormField>

      <FormField label="Popup Size">
        <RadioGroup
          name="popupSize"
          options={SIZE_OPTIONS}
          value={props.settings.popupSize}
          onChange={(value) => props.onUpdateSetting("popupSize", value)}
        />
      </FormField>
    </Section>
  );
}
