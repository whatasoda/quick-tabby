# Privacy Policy

*Last updated: December 2024*

## Overview

QuickTabby is committed to protecting your privacy. This policy explains what data we collect and how we use it.

## Data Collection

**QuickTabby does not collect, transmit, or store any personal data on external servers.**

All data is stored locally on your device using Chrome's built-in storage APIs.

## Data Stored Locally

QuickTabby stores the following data locally on your device:

### Tab Usage Data
- **MRU (Most Recently Used) order**: A list of tab IDs sorted by recent usage
- **Tab thumbnails**: Cached screenshots of tab content for visual previews

This data is stored using:
- `chrome.storage.local` for MRU data and settings
- IndexedDB for tab thumbnails

### User Settings
- Display preferences
- Keyboard shortcut preferences
- Window mode preferences

## Permissions Used

QuickTabby requires the following Chrome permissions:

| Permission | Purpose |
|------------|---------|
| `tabs` | Access tab information (title, URL, favicon) for display and switching |
| `storage` | Store MRU data and user settings locally |
| `activeTab` | Capture thumbnails of the currently active tab |
| `alarms` | Schedule cleanup of expired thumbnail data |

## Third-Party Services

QuickTabby does not use any third-party analytics, tracking, or advertising services.

## Data Sharing

We do not share any data with third parties. All data remains on your device.

## Data Deletion

To delete all QuickTabby data:
1. Right-click the QuickTabby icon
2. Select "Remove from Chrome"

This will remove all locally stored data including MRU history and thumbnails.

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.

## Contact

If you have questions about this privacy policy, please open an issue on our [GitHub repository](https://github.com/whatasoda/quick-tabby).
