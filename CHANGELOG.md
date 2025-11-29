# Changelog

All notable changes to the MFB Forecasting UI will be documented in this file.

## [Unreleased]

### Added
- Alert system UI (US #11, #17)
  - Alert notification bell component with unread count
  - Alert list component with actions (mark read, dismiss)
  - Full alerts page with filtering
  - Alert preferences page for customization
  - Integration with site header
  - Real-time polling for new alerts
- API clients
  - Adjustments API client with full CRUD
  - Enhanced alerts API client
- Utility functions
  - Date formatting and manipulation
  - Number and metric formatting
  - Input validation utilities
  - Error handling hooks
- UI components
  - Loading states and skeletons
  - Empty state component
- Configuration
  - Application constants
  - TypeScript types and interfaces
  - Prettier and EditorConfig
  - VS Code workspace settings
- Documentation
  - Features documentation
  - Development guide
  - Contributing guidelines
  - Testing guide
  - Deployment guide

### Changed
- Site header now includes alert bell for authenticated users
- Updated navigation to include alerts page
- Enhanced package.json with format and type-check scripts

### Fixed
- Various UI improvements and bug fixes

## [0.1.0] - 2024-11-29

### Added
- Initial release
- Next.js 16 with React 19
- Clerk authentication
- Item browsing and forecast visualization
- Purchase plan with CSV export
- Responsive design with TailwindCSS
- shadcn/ui components
