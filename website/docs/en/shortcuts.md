# Keyboard Shortcuts

## Opening QuickTabby

| Shortcut | Action |
|----------|--------|
| `Alt+Q` | Open popup |
| `Alt+Shift+P` | Open popup (secondary) |

Each popup command has its own mode setting (All Windows or Current Window) that can be configured in Options.

### Select on Re-press

The "Open popup (secondary)" shortcut supports "Select on re-press" feature. When enabled, pressing the shortcut again while the popup is open will switch to the currently selected tab and close the popup.

:::warning
Due to Chrome extension limitations, "Select on re-press" is **only available for "Open popup (secondary)"**. The main "Open popup" shortcut (`Alt+Q`) does not support this feature because Chrome handles it differently.

If you want to use this feature, configure "Open popup (secondary)" with your preferred shortcut in `chrome://extensions/shortcuts`.
:::

## Popup Navigation

| Shortcut | Action |
|----------|--------|
| `↑` / `k` | Move selection up |
| `↓` / `j` | Move selection down |
| `Enter` | Switch to selected tab |
| `Esc` | Close popup |

## Search

| Shortcut | Action |
|----------|--------|
| Start typing | Filter tabs by title or URL |
| `Backspace` | Clear search character by character |
| `Esc` | Clear search (if search is active) |

### Fuzzy Matching

The search uses fuzzy matching, so you can find tabs even with typos or partial matches. Results are sorted by relevance, with the best matches appearing first.

### Japanese Input Support

You can type in Romaji to find tabs with Hiragana or Katakana titles:

| Type | Finds |
|------|-------|
| `nihon` | にほん, ニホン |
| `tokyo` | とうきょう, トウキョウ |

### Search Bar Mode

Each popup command can be configured with its own search bar mode in Options:

- **Always Visible**: Search bar is always shown and focused
- **Show on Type**: Search bar appears when you start typing

## Tab Navigation

| Shortcut | Action |
|----------|--------|
| `Alt+Shift+H` | Switch to left tab (loops at edges) |
| `Alt+Shift+L` | Switch to right tab (loops at edges) |

## Customization

You can customize keyboard shortcuts in Chrome:

1. Go to `chrome://extensions/shortcuts`
2. Find QuickTabby
3. Set your preferred shortcuts

:::tip
The shortcuts above are defaults. You can change them to any combination that works for you.
:::
