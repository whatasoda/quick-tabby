# Privacy Policy

_Last updated: January 2025_

## Overview

QuickTabby is committed to protecting your privacy. This policy explains what data we collect and how we use it.

## Single Purpose

QuickTabby has one clear purpose: **fast tab switching sorted by recently used order**.

All features support this core functionality:

- Tab list sorted by recent usage (MRU)
- Keyboard-first navigation for quick access
- Tab thumbnails for visual identification
- Multi-window support for comprehensive tab management

This extension does not bundle unrelated features or functionalities.

## Data Collection

**QuickTabby does not collect, transmit, or store any personal data on external servers.**

All data is stored locally on your device using Chrome's built-in storage APIs.

## Data Stored Locally

QuickTabby stores the following data locally on your device:

### Tab Usage Data

- **Recently used order**: A list of tab IDs sorted by recent usage
- **Tab thumbnails**: Cached screenshots of tab content for visual previews

This data is stored using:

- `chrome.storage.local` for tab order data and settings
- IndexedDB for tab thumbnails

### Important Notice About Screenshots

**Warning**: Tab screenshots may contain sensitive information visible on your screen at the time of capture. This can include:

- Personal or confidential information
- Passwords or credentials
- Private communications
- Financial information

**QuickTabby does not protect this data** from other users of your device or browser. Anyone with access to your computer may be able to view stored screenshots.

For complete terms regarding data responsibility, please see our [Terms of Service](/en/terms).

### User Settings

- Display preferences
- Keyboard shortcut preferences
- Window mode preferences

## Permissions Used

QuickTabby requires the following Chrome permissions:

| Permission  | Purpose                                                                |
| ----------- | ---------------------------------------------------------------------- |
| `tabs`      | Access tab information (title, URL, favicon) for display and switching |
| `storage`   | Store tab order data and user settings locally                         |
| `activeTab` | Capture thumbnails of the currently active tab                         |
| `alarms`    | Schedule cleanup of expired thumbnail data                             |
| `offscreen` | Detect system color scheme for icon theming                            |

## Third-Party Services

QuickTabby does not use any third-party analytics, tracking, or advertising services.

## Data Sharing

We do not share any data with third parties. All data remains on your device.

## Data Deletion

To delete all QuickTabby data:

1. Right-click the QuickTabby icon
2. Select "Remove from Chrome"

This will remove all locally stored data including tab history and thumbnails.

## Your Responsibilities

While QuickTabby stores all data locally and does not transmit it externally, you are responsible for:

- Securing your device from unauthorized access
- Managing who has access to your browser profile
- Understanding that locally stored data is accessible to anyone with device access

See our [Terms of Service](/en/terms) for complete details.

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.

## Related Documents

- [Terms of Service](/en/terms)

## Contact

If you have questions about this privacy policy, please open an issue on our [GitHub repository](https://github.com/whatasoda/quick-tabby).
