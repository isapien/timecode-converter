# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-07-18

### Added
- 🎬 **Drop-Frame Timecode Support** - Full SMPTE drop-frame timecode support for 29.97 and 59.94 fps
  - Auto-detection of drop-frame format from semicolon separator (HH:MM:SS;FF)
  - Accurate frame dropping at minute boundaries (except every 10th minute)
  - Smart auto-detection for `secondsToTimecode()`: uses drop-frame for durations ≥ 1 minute at 29.97/59.94 fps
  - Optional third parameter to override auto-detection
  - Comprehensive test suite validated against industry-standard `smpte-timecode` library
- ⚠️ **Usage Warnings** - Helpful warnings to prevent common drop-frame mistakes
  - Warns when using drop-frame format (semicolon) with non-drop-frame rates
  - Warns when explicitly choosing non-drop frame for long durations at 29.97/59.94 fps
- 🔍 **Timecode Validation** - New validation function for checking timecode validity
  - `validateTimecode()` function with detailed error and warning messages
  - Validates format, ranges, and drop-frame rules
  - Returns structured validation results with parsed components
- 🛠️ **Helper Functions** - Export utility functions for advanced users
  - `isDropFrameTimecode()` - Check if a timecode string uses drop-frame format
  - `isDropFrameRate()` - Check if a frame rate supports drop-frame

### Changed
- **BREAKING**: Frame rate is now required for all timecode string conversions
  - `timecodeToSeconds('00:10:00:00')` now throws an error
  - Must specify: `timecodeToSeconds('00:10:00:00', 25)`
  - This ensures accurate calculations and prevents silent errors

### Fixed
- Improved floating-point precision in frame calculations
- Enhanced frame boundary handling for accurate conversions

## [1.0.0] - 2024-07-17

### Initial Fork Release
- 🚀 **TypeScript** - Full TypeScript support with strict mode
- 📦 **Modern Build** - Dual ESM/CJS builds using tsup
- 🧪 **Vitest** - Fast, modern testing framework
- 🔧 **pnpm** - Fast, disk space efficient package manager
- ✨ **Improved DX** - Better tooling and type safety
- 🎯 **Required Frame Rate** - Frame rate must be explicitly specified (no defaults)
- 🔧 **Enhanced Precision** - Improved floating-point precision handling
- ⚡ **Better API Design** - Clear, explicit parameters for professional use

### Changed from Original
- Converted from JavaScript to TypeScript
- Modernized build tooling and testing framework
- Removed default frame rate (was 25fps) - now required parameter
- Fixed various precision issues in calculations
- Updated package ownership and repository URLs