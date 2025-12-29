# Features

QuickTabby is a Chrome extension that makes tab switching fast and efficient.

## Core Features

### Recently Used Order

QuickTabby automatically tracks which tabs you've used most recently. When you open the popup, tabs are sorted by recency, so your most relevant tabs are always at the top.

### Keyboard-First Navigation

Navigate through tabs without touching your mouse:

- **Alt+Q** - Open QuickTabby popup
- **Arrow Up/Down** or **j/k** - Move selection up/down
- **Enter** - Switch to selected tab
- **Esc** - Close popup

### Multi-Window Support

Switch between tabs across all browser windows, or focus on just the current window:

- **Alt+Shift+A** - All windows mode
- **Alt+Shift+C** - Current window mode

### Tab Thumbnails

See visual previews of your tabs to quickly identify the one you're looking for.

![QuickTabby Dark Theme](/screenshots/dark-main.png)

## Customization Features

### Theme Settings

Choose from three theme modes to match your preferences:

| Mode | Description |
|------|-------------|
| **Light** | Always use light theme |
| **Dark** | Always use dark theme |
| **Auto** | Automatically match your operating system's theme |

The Auto mode detects your OS preference and switches themes accordingly, providing a seamless experience whether you're working day or night.

### Privacy Settings

Control how QuickTabby handles screenshots for sensitive content:

#### Skip Patterns

Define URL patterns where screenshots should not be captured at all. Useful for:

- Banking websites
- Password managers
- Internal company tools

Default skip patterns include:

- `chrome://*`
- `chrome-extension://*`
- `edge://*`
- `about:*`

#### Blur Patterns

Define URL patterns where screenshots should be captured but displayed with a blur effect. This provides privacy while still showing visual context for the tab.

**Pattern format**: Use match patterns like `*://example.com/*` or `*://*.bank.com/*`

### Multiple Keybindings

Assign multiple keyboard shortcuts to the same action for flexible navigation:

- Each action can have multiple keybindings
- Customize shortcuts in the Options page
- Supports modifier keys: Ctrl, Alt, Shift, Cmd/Meta

For example, you can set both `j` and `Arrow Down` to move selection down, accommodating both Vim-style and traditional navigation preferences.

See [Keyboard Shortcuts](/en/shortcuts) for the full list of customizable shortcuts.
