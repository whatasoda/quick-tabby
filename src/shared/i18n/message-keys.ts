/**
 * Message keys for i18n.
 * These constants provide type safety and autocomplete for translation keys.
 * Each key corresponds to an entry in _locales/{locale}/messages.json
 */

export const MSG = {
  // Common strings
  COMMON_LOADING: "common_loading",
  COMMON_SAVED: "common_saved",
  COMMON_ADD: "common_add",
  COMMON_RESET: "common_reset",
  COMMON_UNTITLED: "common_untitled",

  // Popup strings
  POPUP_CURRENT_WINDOW: "popup_currentWindow",
  POPUP_ALL_WINDOWS: "popup_allWindows",
  POPUP_TOGGLE_MODE_HINT: "popup_toggleModeHint",
  POPUP_KEYBOARD_SHORTCUTS: "popup_keyboardShortcuts",
  POPUP_SETTINGS: "popup_settings",
  POPUP_OPEN_SETTINGS: "popup_openSettings",
  POPUP_SELECT_TO_PREVIEW: "popup_selectToPreview",
  POPUP_NO_PREVIEW: "popup_noPreview",

  // Keybinding labels
  KEYBINDING_MOVE_DOWN: "keybinding_moveDown",
  KEYBINDING_MOVE_UP: "keybinding_moveUp",
  KEYBINDING_CONFIRM: "keybinding_confirm",
  KEYBINDING_CANCEL: "keybinding_cancel",
  KEYBINDING_TOGGLE_MODE: "keybinding_toggleMode",
  KEYBINDING_PRESS_KEY: "keybinding_pressKey",
  KEYBINDING_REMOVE: "keybinding_removeKeybinding",

  // Options page strings
  OPTIONS_TITLE: "options_title",
  OPTIONS_APPEARANCE: "options_appearance",
  OPTIONS_THEME: "options_theme",
  OPTIONS_THEME_AUTO: "options_themeAuto",
  OPTIONS_THEME_LIGHT: "options_themeLight",
  OPTIONS_THEME_DARK: "options_themeDark",
  OPTIONS_POPUP_SIZE: "options_popupSize",
  OPTIONS_SIZE_SMALL: "options_sizeSmall",
  OPTIONS_SIZE_MEDIUM: "options_sizeMedium",
  OPTIONS_SIZE_LARGE: "options_sizeLarge",
  OPTIONS_BEHAVIOR: "options_behavior",
  OPTIONS_PREVIEW_MODE: "options_previewMode",
  OPTIONS_PREVIEW_MODE_DESC: "options_previewModeDesc",
  OPTIONS_THUMBNAIL_QUALITY: "options_thumbnailQuality",
  OPTIONS_THUMBNAIL_QUALITY_DESC: "options_thumbnailQualityDesc",
  OPTIONS_QUALITY_STANDARD: "options_qualityStandard",
  OPTIONS_QUALITY_HIGH: "options_qualityHigh",
  OPTIONS_QUALITY_ULTRA: "options_qualityUltra",
  OPTIONS_BLUR_THUMBNAILS: "options_blurThumbnails",
  OPTIONS_BLUR_THUMBNAILS_DESC: "options_blurThumbnailsDesc",
  OPTIONS_DEFAULT_MODE: "options_defaultMode",
  OPTIONS_DEFAULT_MODE_DESC: "options_defaultModeDesc",
  OPTIONS_MODE_LAST_USED: "options_modeLastUsed",
  OPTIONS_MODE_ALL: "options_modeAll",
  OPTIONS_MODE_CURRENT: "options_modeCurrent",
  OPTIONS_POPUP_KEYBINDINGS: "options_popupKeybindings",
  OPTIONS_GLOBAL_SHORTCUTS: "options_globalShortcuts",
  OPTIONS_SELECT_ON_REPRESS: "options_selectOnRepress",
  OPTIONS_CHANGE_SHORTCUTS: "options_changeShortcuts",
  OPTIONS_SHORTCUTS_NOTE: "options_shortcutsNote",
  OPTIONS_PRIVACY: "options_privacy",
  OPTIONS_SKIP_SCREENSHOT: "options_skipScreenshot",
  OPTIONS_SKIP_SCREENSHOT_DESC: "options_skipScreenshotDesc",
  OPTIONS_BLUR_SCREENSHOT: "options_blurScreenshot",
  OPTIONS_BLUR_SCREENSHOT_DESC: "options_blurScreenshotDesc",
  OPTIONS_NO_PATTERNS: "options_noPatterns",
  OPTIONS_REMOVE_PATTERN: "options_removePattern",
  OPTIONS_PATTERN_EXISTS: "options_patternExists",
  OPTIONS_PATTERN_PLACEHOLDER: "options_patternPlaceholder",

  // Manifest strings (used with __MSG_key__ format)
  MANIFEST_COMMAND_OPEN_POPUP: "manifest_commandOpenPopup",
  MANIFEST_COMMAND_MOVE_TAB_LEFT: "manifest_commandMoveTabLeft",
  MANIFEST_COMMAND_MOVE_TAB_RIGHT: "manifest_commandMoveTabRight",

  // Popup mode setting
  OPTIONS_POPUP_MODE: "options_popupMode",
} as const;

export type MessageKey = (typeof MSG)[keyof typeof MSG];
