# Migration Guide: From Original timecode-converter to v2.0

This guide helps you migrate from the original timecode-converter to the new TypeScript version with enhanced features.

## Breaking Changes

### 1. Frame Rate is Now Required

The biggest change is that frame rate must be explicitly specified for all timecode string conversions.

**Before:**
```js
// Old API - frame rate defaulted to 25
timecodeToSeconds('00:10:00:00') // Assumed 25 fps
```

**After:**
```js
// New API - frame rate is required
timecodeToSeconds('00:10:00:00', 25) // Must specify fps
```

**Why this change?** Different frame rates produce different results. Defaulting to 25 fps was problematic for NTSC users and led to subtle bugs. Explicit frame rates ensure accurate conversions.

### 2. TypeScript Types

All functions now have strict TypeScript types:

```typescript
import type { Seconds, FrameRate, TimecodeFormat } from 'timecode-converter'

// Frame rates are limited to standard values
type FrameRate = 23.976 | 24 | 25 | 29.97 | 30 | 50 | 59.94 | 60

// Timecode formats include drop-frame support
type TimecodeFormat = string // Format: "HH:MM:SS:FF" or "HH:MM:SS;FF"
```

## New Features

### 1. Drop-Frame Timecode Support

The library now fully supports SMPTE drop-frame timecode for 29.97 and 59.94 fps.

**Auto-detection when parsing:**
```js
// Semicolon indicates drop-frame format
timecodeToSeconds('01:00:00;00', 29.97) // Drop-frame
timecodeToSeconds('01:00:00:00', 29.97) // Non-drop frame
```

**Smart defaults when generating:**
```js
// For 29.97/59.94 fps, automatically uses drop-frame for durations ≥ 1 minute
secondsToTimecode(3600, 29.97)  // Returns: '01:00:00;00' (auto drop-frame)
secondsToTimecode(30, 29.97)    // Returns: '00:00:30:00' (auto non-drop)

// Override auto-detection with explicit parameter
secondsToTimecode(3600, 29.97, false) // Force non-drop: '01:00:00:00'
secondsToTimecode(30, 29.97, true)    // Force drop-frame: '00:00:29;29'
```

### 2. Timecode Validation

New validation function for checking timecode strings:

```js
import { validateTimecode } from 'timecode-converter'

const result = validateTimecode('25:00:00:00', 25)
// {
//   valid: false,
//   errors: ['Hours cannot exceed 23'],
//   warnings: [],
//   format: 'non-drop'
// }

// Drop-frame validation
const dfResult = validateTimecode('00:01:00;01', 29.97)
// {
//   valid: false,
//   errors: ['Invalid drop-frame timecode. Frames 00 and 01 don\'t exist at minute 1'],
//   warnings: [],
//   format: 'drop-frame'
// }
```

### 3. Helper Functions

New utilities for working with drop-frame:

```js
import { isDropFrameTimecode, isDropFrameRate } from 'timecode-converter'

// Check timecode format
isDropFrameTimecode('01:00:00;00') // true (semicolon)
isDropFrameTimecode('01:00:00:00') // false (colons)

// Check if frame rate supports drop-frame
isDropFrameRate(29.97) // true
isDropFrameRate(25)    // false
```

## Migration Strategies

### Strategy 1: Minimal Changes (Non-Drop Frame Only)

If you only work with non-drop frame timecode, migration is straightforward:

```js
// Old code
const seconds = timecodeToSeconds('00:10:00:00')
const timecode = secondsToTimecode(600)

// New code - just add frame rate
const seconds = timecodeToSeconds('00:10:00:00', 25)
const timecode = secondsToTimecode(600, 25)
```

### Strategy 2: Embrace Drop-Frame Auto-Detection

For NTSC workflows, take advantage of auto-detection:

```js
// Let the library handle drop-frame automatically
const timecode = secondsToTimecode(3600, 29.97) // Auto: '01:00:00;00'

// Parse any format automatically
const seconds = timecodeToSeconds(someTimecode, 29.97) // Works with ; or :
```

### Strategy 3: Explicit Control

For maximum control, always specify drop-frame preference:

```js
// Always be explicit about drop-frame
const dropFrame = secondsToTimecode(3600, 29.97, true)   // '01:00:00;00'
const nonDrop = secondsToTimecode(3600, 29.97, false)    // '01:00:00:00'
```

### Which Strategy to Choose?

- **Use auto-detection (Strategy 2)** for:
  - General broadcast applications
  - When accuracy with real-world time is important
  - Mixed duration content (short and long)
  
- **Use explicit control (Strategy 3)** for:
  - Specific workflow requirements
  - Maintaining compatibility with existing systems
  - When you need consistent format regardless of duration

## Common Patterns

### Working with Configuration

Store frame rates in configuration:

```js
// config.js
export const PROJECT_CONFIG = {
  frameRate: 29.97,
  useDropFrame: true, // Optional: let auto-detection handle it
}

// usage.js
import { PROJECT_CONFIG } from './config'

const timecode = secondsToTimecode(
  duration, 
  PROJECT_CONFIG.frameRate,
  PROJECT_CONFIG.useDropFrame
)
```

### Handling User Input

When accepting timecode from users:

```js
function processUserTimecode(input, frameRate) {
  // Validate first
  const validation = validateTimecode(input, frameRate)
  
  if (!validation.valid) {
    throw new Error(`Invalid timecode: ${validation.errors.join(', ')}`)
  }
  
  // Show warnings if any
  if (validation.warnings.length > 0) {
    console.warn('Timecode warnings:', validation.warnings.join(', '))
  }
  
  // Convert to seconds (auto-detects drop-frame from format)
  return timecodeToSeconds(input, frameRate)
}
```

### Round-Trip Conversions

Maintain format consistency:

```js
function adjustTimecode(timecode, offsetSeconds, frameRate) {
  // Detect if input is drop-frame
  const isDropFrame = isDropFrameTimecode(timecode)
  
  // Convert to seconds
  const seconds = timecodeToSeconds(timecode, frameRate)
  
  // Apply adjustment
  const newSeconds = seconds + offsetSeconds
  
  // Convert back, preserving drop-frame format
  return secondsToTimecode(newSeconds, frameRate, isDropFrame)
}
```

## Warnings and Best Practices

### 1. Frame Rate Mismatch Warnings

The library warns about potentially incorrect usage:

```js
// Using drop-frame with wrong frame rate
timecodeToSeconds('01:00:00;00', 25)
// ⚠️ Warning: Drop-frame format used with non-drop-frame rate 25 fps

// Using 29.97 without drop-frame for long durations
secondsToTimecode(3600, 29.97, false)
// ⚠️ Warning: Consider using drop-frame format for durations over 1 hour
```

### 2. Precision and Accuracy Improvements

The new version has significantly improved floating-point precision and accuracy:

```js
// More accurate frame boundary calculations
secondsToTimecode(73.26693360026694, 29.97) // Precise frame alignment

// Drop-frame calculations validated against SMPTE standards
secondsToTimecode(3600, 29.97, true)  // Exactly matches SMPTE timecode
```

All drop-frame calculations have been validated against the industry-standard `smpte-timecode` library to ensure broadcast accuracy.

### 3. Testing Your Migration

After migrating, test edge cases:

```js
// Test data
const testCases = [
  { seconds: 0, fps: 29.97 },      // Zero
  { seconds: 60, fps: 29.97 },     // 1 minute boundary  
  { seconds: 3600, fps: 29.97 },   // 1 hour
  { seconds: 86400, fps: 29.97 },  // 24 hours
]

// Verify conversions round-trip correctly
testCases.forEach(({ seconds, fps }) => {
  const timecode = secondsToTimecode(seconds, fps)
  const backToSeconds = timecodeToSeconds(timecode, fps)
  
  console.assert(
    Math.abs(backToSeconds - seconds) < 0.01,
    `Round-trip failed for ${seconds}s at ${fps}fps`
  )
})
```

## Quick Reference

| Old API | New API | Notes |
|---------|---------|-------|
| `timecodeToSeconds(tc)` | `timecodeToSeconds(tc, fps)` | Frame rate required |
| N/A | `timecodeToSeconds(tc, fps)` auto-detects `;` | Drop-frame support |
| `secondsToTimecode(s)` | `secondsToTimecode(s, fps)` | Frame rate required |
| N/A | `secondsToTimecode(s, fps, dropFrame?)` | Optional drop-frame |
| N/A | `validateTimecode(tc, fps?)` | New validation |
| N/A | `isDropFrameTimecode(tc)` | Format detection |
| N/A | `isDropFrameRate(fps)` | Rate validation |

## Getting Help

- See the [README](../README.md) for complete API documentation
- Check the [test files](./src/) for usage examples
- File issues on [GitHub](https://github.com/jordanburke/timecode-converter/issues)