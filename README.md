<p align="center">
  <img src="FIverr%20Refresh%20Pro.png" alt="Logo" />
</p>



# Fiverr Infinite Auto Refresh

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A professional, human-like Chrome extension to automatically refresh Fiverr tabs with randomized intervals and night-time slowdown logic. Designed to maintain activity status safely and efficiently.

## Features

- 🤖 **Human-Like Behavior**: Randomized refresh intervals (30s–45s) to mimic human activity.
- 🌙 **Night Mode**: Automatically slows down refreshes (60s–90s) between 12 AM and 6 AM.
- ⚡ **Auto-Stop**: Intelligent detection pauses refreshing when you leave Fiverr or the browser is closed.
- 🔄 **Infinite Loop**: Resumes automatically ensuring you stay online.
- 🎨 **Premium UI**: Modern, dark-themed popup interface.

## Installation

1.  Download the latest release or clone this repository.
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Enable **Developer mode** in the top right.
4.  Click **Load unpacked** and select the extension directory.

## Usage

1.  Navigate to [Fiverr.com](https://www.fiverr.com).
2.  Click the extension icon in the toolbar.
3.  Click **Start Auto Refresh**.
4.  The extension will now manage your active status in the background.

## Project Structure

```text
/
├── assets/         # Static assets (icons)
├── src/            # Source code
│   ├── background/ # Service worker & logic
│   ├── popup/      # UI components
│   └── shared/     # Config & utilities
├── manifest.json   # Extension configuration
└── README.md       # Documentation
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
