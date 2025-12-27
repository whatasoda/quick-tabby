export type {
  PopupSize,
  ThumbnailQuality,
  ThemePreference,
  DefaultMode,
  Keybinding,
  KeybindingList,
  KeybindingsConfig,
  CommandName,
  CommandSettings,
  ThumbnailConfig,
  Settings,
  LegacyKeybindings,
  LegacySettings,
} from "./settings-types.ts";

export {
  DEFAULT_SETTINGS,
  THUMBNAIL_QUALITIES,
  POPUP_SIZES,
  POPUP_LAYOUT,
  getTabListWidth,
  getPreviewWidth,
  getMaxPopupWidth,
} from "./settings-defaults.ts";

export type { MigrationResult } from "./settings-migration.ts";
export { migrateSettings } from "./settings-migration.ts";
