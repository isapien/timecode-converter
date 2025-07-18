# timecode-converter

A modern TypeScript library for broadcast timecode conversions with full SMPTE drop-frame support.

## Features

- 🎯 **Accurate Conversions** - Frame-accurate timecode to seconds conversions
- 🎬 **SMPTE Drop-Frame** - Full support for 29.97 and 59.94 fps drop-frame timecode
- 🤖 **Smart Auto-Detection** - Automatically handles drop-frame when appropriate
- 📦 **TypeScript First** - Written in TypeScript with strict types
- ✅ **Validation** - Built-in timecode validation with detailed error messages
- 🚀 **Modern Build** - Dual ESM/CJS builds, tree-shakeable
- 🔧 **Zero Dependencies** - No external runtime dependencies
- ⚡ **High Performance** - Optimized with improved floating-point precision

## Installation

```bash
npm install timecode-converter
# or
pnpm add timecode-converter
# or
yarn add timecode-converter
```

## Quick Start

```typescript
import { secondsToTimecode, timecodeToSeconds } from 'timecode-converter'

// Convert seconds to timecode
secondsToTimecode(90, 29.97)  // '00:01:29;29' (auto drop-frame)
secondsToTimecode(90, 25)     // '00:01:30:00' (PAL)

// Convert timecode to seconds  
timecodeToSeconds('00:01:30:00', 25)     // 90
timecodeToSeconds('00:01:29;29', 29.97)  // 90 (auto-detects drop-frame)
```

## Drop-Frame Support

This library provides comprehensive SMPTE drop-frame timecode support with smart defaults.

### What is Drop-Frame Timecode?

Drop-frame is used with NTSC frame rates (29.97, 59.94 fps) to keep timecode aligned with real-world time. It works by skipping frame numbers 00 and 01 at the start of each minute, except every 10th minute.

### Smart Auto-Detection

The library intelligently handles drop-frame based on context:

```typescript
// Parsing: Auto-detects from format (semicolon = drop-frame)
timecodeToSeconds('01:00:00;00', 29.97)  // Drop-frame
timecodeToSeconds('01:00:00:00', 29.97)  // Non-drop

// Generating: Auto-selects based on duration at 29.97/59.94 fps
secondsToTimecode(3600, 29.97)  // '01:00:00;00' (≥1 min = drop-frame)
secondsToTimecode(30, 29.97)    // '00:00:30:00' (<1 min = non-drop)

// Override auto-detection
secondsToTimecode(3600, 29.97, false)  // '01:00:00:00' (force non-drop)
secondsToTimecode(30, 29.97, true)     // '00:00:29;29' (force drop-frame)
```

## API Reference

### Core Functions

#### `secondsToTimecode(seconds, frameRate, dropFrame?)`
Converts seconds to timecode format.

```typescript
secondsToTimecode(
  seconds: number,      // Time in seconds
  frameRate: FrameRate, // 23.976, 24, 25, 29.97, 30, 50, 59.94, or 60
  dropFrame?: boolean   // Optional: true/false, auto-detects if omitted
): string              // Returns "HH:MM:SS:FF" or "HH:MM:SS;FF"
```

#### `timecodeToSeconds(timecode, frameRate?)`
Converts timecode to seconds. Auto-detects drop-frame from semicolon separator.

```typescript
timecodeToSeconds(
  timecode: string | number,  // Timecode string or seconds
  frameRate?: FrameRate       // Required for timecode strings
): number                     // Returns seconds
```

#### `shortTimecode(timecode, frameRate?)`
Formats timecode without frames (HH:MM:SS).

```typescript
shortTimecode(
  timecode: string | number,
  frameRate?: FrameRate
): string  // Returns "HH:MM:SS"
```

### Validation Functions

#### `validateTimecode(timecode, frameRate?)`
Validates timecode format and values.

```typescript
validateTimecode('25:00:00:00', 25)
// Returns:
// {
//   valid: false,
//   errors: ['Hours cannot exceed 23'],
//   warnings: [],
//   format: 'non-drop',
//   components: undefined
// }
```

### Helper Functions

#### `isDropFrameTimecode(timecode)`
Checks if timecode uses drop-frame format (semicolon separator).

```typescript
isDropFrameTimecode('01:00:00;00')  // true
isDropFrameTimecode('01:00:00:00')  // false
```

#### `isDropFrameRate(frameRate)`
Checks if frame rate supports drop-frame.

```typescript
isDropFrameRate(29.97)  // true
isDropFrameRate(25)     // false
```

## Examples

### Basic Conversions

```typescript
import { secondsToTimecode, timecodeToSeconds } from 'timecode-converter'

// PAL (25 fps)
secondsToTimecode(90, 25)              // '00:01:30:00'
timecodeToSeconds('00:01:30:00', 25)  // 90

// NTSC (29.97 fps) with auto drop-frame
secondsToTimecode(3600, 29.97)        // '01:00:00;00' (auto drop-frame)
secondsToTimecode(30, 29.97)          // '00:00:30:00' (auto non-drop)

// Film (24 fps)
secondsToTimecode(3600, 24)           // '01:00:00:00'
timecodeToSeconds('01:00:00:00', 24)  // 3600
```

### Working with Drop-Frame

```typescript
// Let auto-detection handle it
const timecode = secondsToTimecode(durationInSeconds, 29.97)

// Or be explicit
const dropFrame = secondsToTimecode(3600, 29.97, true)   // Force drop-frame
const nonDrop = secondsToTimecode(3600, 29.97, false)    // Force non-drop

// Parsing handles both formats automatically
timecodeToSeconds('01:00:00;00', 29.97)  // Semicolon = drop-frame
timecodeToSeconds('01:00:00:00', 29.97)  // Colon = non-drop
```

### Validation

```typescript
import { validateTimecode } from 'timecode-converter'

function processUserInput(timecode: string, fps: number) {
  const validation = validateTimecode(timecode, fps)
  
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '))
  }
  
  if (validation.warnings.length > 0) {
    console.warn('Warnings:', validation.warnings)
  }
  
  return timecodeToSeconds(timecode, fps)
}
```

### Round-Trip Conversions

```typescript
import { 
  timecodeToSeconds, 
  secondsToTimecode, 
  isDropFrameTimecode 
} from 'timecode-converter'

function offsetTimecode(timecode: string, offsetSeconds: number, fps: number) {
  // Preserve drop-frame format through conversion
  const isDropFrame = isDropFrameTimecode(timecode)
  const seconds = timecodeToSeconds(timecode, fps)
  const newSeconds = seconds + offsetSeconds
  
  return secondsToTimecode(newSeconds, fps, isDropFrame)
}
```

## Frame Rate Reference

| Frame Rate | Standard | Drop-Frame | Common Use |
|------------|----------|------------|------------|
| 23.976 | NTSC Film | No | Film transferred to video |
| 24 | Film | No | Cinema |
| 25 | PAL | No | European TV |
| 29.97 | NTSC | Yes* | American TV |
| 30 | NTSC | No | American TV (rare) |
| 50 | PAL | No | European HD |
| 59.94 | NTSC | Yes* | American HD |
| 60 | NTSC | No | American HD (rare) |

\* Drop-frame is optional but recommended for broadcast accuracy

## Migration from v1

If you're upgrading from the original timecode-converter, see our [Migration Guide](docs/MIGRATION.md) for detailed instructions.

Key changes:
- Frame rate is now required (no more defaults)
- Full drop-frame timecode support
- New validation functions
- Improved precision and accuracy
- TypeScript types included

## Development

```bash
# Clone the repository
git clone https://github.com/jordanburke/timecode-converter.git
cd timecode-converter

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the library
pnpm build

# Run tests in watch mode
pnpm test:watch
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

This is a complete TypeScript rewrite of the original [timecode-converter](https://github.com/Laurian/timecode-converter), originally extracted from [@bbc/react-transcript-editor](https://github.com/bbc/react-transcript-editor), with original domain logic from [@bevand10](https://github.com/bevand10).

While this started as a fork, it has been completely rewritten with:
- Full TypeScript implementation
- SMPTE drop-frame support
- Smart auto-detection
- Comprehensive validation
- Modern tooling and testing
- Improved accuracy and precision

## License

MIT