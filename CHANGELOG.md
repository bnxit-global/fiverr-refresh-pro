# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-01-16

### Added
- **Custom Time Input**: Enter refresh interval in seconds (10-3600) instead of preset dropdown.
- **5-Cycle Inbox Priority**: Inbox is automatically visited every 5 refresh cycles.
- **Sequential URL Rotation**: Pages rotate in order instead of random selection.

### Changed
- Reduced randomization from 20-30% to **15-20%** for tighter timing control.

## [1.1.0] - 2026-01-14

### Added
- **Smart Navigation**: Dynamic rotation through key Fiverr pages (Dashboard, Earnings, Briefs).
- **Inbox Priority**: Mandatory inbox check every 2 minutes to ensure user response safety.
- **Theme Engine**: Complete Dark/Light mode support with persistence.
- **Improved UI**: Centered header, high-contrast borders, and visible theme toggle.
- **Selection**: Added 30-second refresh option.

### Fixed
- Reverted Firefox-specific configurations to focus exclusively on Chrome performance.
- Cleaned up redundant background scripts for a smaller footprint.
- Fixed layout clashing by repositioning the theme toggle to the top-right corner.

## [1.0.0] - 2026-01-14

### Added
- Initial release with modular ES Modules architecture.
- Human-like randomized timing algorithm.
- Night mode logic (00:00 - 06:00).
- Premium design for the popup interface.
