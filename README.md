## timecode converter

<!-- _One liner + link to confluence page_
_Screenshot of UI - optional_ -->

A modernized TypeScript fork of the original timecode-converter. This is a dependency-free `timecode-converter` module utility that can be used either client side or server side. 

Originally extracted from [`@bbc/react-transcript-editor/packages/util/timecode-converter`](https://github.com/bbc/react-transcript-editor/tree/master/packages/util/timecode-converter), and original code domain logic from [@bevand10](https://github.com/bevand10) 🙌

### What's New in This Fork
- 🚀 **TypeScript** - Full TypeScript support with strict mode
- 📦 **Modern Build** - Dual ESM/CJS builds using tsup
- 🧪 **Vitest** - Fast, modern testing framework
- 🔧 **pnpm** - Fast, disk space efficient package manager
- ✨ **Improved DX** - Better tooling and type safety
- 🎯 **Required Frame Rate** - Frame rate must be explicitly specified (no defaults)
- 🔧 **Enhanced Precision** - Improved floating-point precision handling
- ⚡ **Better API Design** - Clear, explicit parameters for professional use
- 🎬 **Drop-Frame Support** - Full SMPTE drop-frame timecode support for 29.97 and 59.94 fps

<details><summary>Why publish it as a standalone module?</summary>

The problem of exporting it from [`@bbc/react-transcript-editor`](https://github.com/bbc/react-transcript-editor) or [`@pietrop/slate-transcript-editor`](https://github.com/pietrop/slate-transcript-editor) is that, somehow it ends up expecting react as a peer dependency. 

And besides that not being ideal, or good practice, not only it can cause problems with keeping up with react peer dependency of other modules, but also add that as a peer dependency to other module consuming it, such as [@pietrop/edl-composer](https://github.com/pietrop/edl-composer) that doesn't really need any of that.
</details>


## Setup

<!-- _stack - optional_
_How to build and run the code/app_ -->

```
git clone git@github.com:jordanburke/timecode-converter.git
```
```
cd timecode-converter
```
```
pnpm install
```
## Usage
Some example, see the test files more more 
```js
import { secondsToTimecode, timecodeToSeconds, shortTimecode } from "timecode-converter";

// Frame rate is REQUIRED for all functions
const fps = 25; // PAL: 25 fps
const ntscFps = 29.97; // NTSC: 29.97 fps

// Converting seconds to timecode (non-drop frame)
const result1 = secondsToTimecode(600, fps);
// '00:10:00:00'

// Converting timecode to seconds
const result2 = timecodeToSeconds('00:10:00:00', fps);
// 600

// Note: When passing seconds as a number, frame rate is optional
const result3 = timecodeToSeconds(600); // No frame rate needed for numeric input
// 600

// Different frame rates produce different results
const result4 = timecodeToSeconds('00:00:01:12', 24); // 24 fps
// 1.5 (1 second + 12 frames at 24fps = 0.5 seconds)

const result5 = secondsToTimecode(1.5, 29.97); // 29.97 fps non-drop
// '00:00:01:14'

// Short timecode (without frames)
const result6 = shortTimecode('00:10:00:00', fps);
// '00:10:00'

const result7 = shortTimecode(600, 30); // 30 fps
// '00:10:00'

// 🎬 DROP-FRAME TIMECODE SUPPORT (NEW!)
// Drop-frame uses semicolon (;) before frames: HH:MM:SS;FF

// Auto-detect drop-frame from format
const dropFrameSeconds = timecodeToSeconds('01:00:00;00', 29.97);
// 3600 seconds (exact)

// Smart auto-detection for drop-frame generation
const autoDropFrame = secondsToTimecode(3600, 29.97); // Auto-detects need for drop-frame
// '01:00:00;00' (uses drop-frame automatically for long durations)

const shortDuration = secondsToTimecode(30, 29.97); // Short duration
// '00:00:30:00' (uses non-drop for durations < 1 minute)

// Override auto-detection
const forcedNonDrop = secondsToTimecode(3600, 29.97, false);
// '01:00:00:00' (forced non-drop frame)

// Validate timecodes
import { validateTimecode } from "timecode-converter";

const validation = validateTimecode('25:00:00:00', 25);
// { valid: false, errors: ["Hours cannot exceed 23"] }

const dropFrameValidation = validateTimecode('00:01:00;01', 29.97);
// { valid: false, errors: ["Invalid drop-frame timecode. Frames 00 and 01 don't exist at minute 1"] }

// Check if a timecode is drop-frame format
import { isDropFrameTimecode, isDropFrameRate } from "timecode-converter";

isDropFrameTimecode('01:00:00;00') // true
isDropFrameTimecode('01:00:00:00') // false
isDropFrameRate(29.97) // true
isDropFrameRate(25) // false
```
## Drop-Frame Timecode Support

This library now fully supports both **drop-frame** and **non-drop frame** timecode formats.

### Understanding Drop-Frame Timecode

Drop-frame timecode is used in NTSC video (29.97 fps) to compensate for the fractional frame rate. It works by dropping frame numbers (not actual frames) at specific intervals:
- Drops frame numbers 00 and 01 at the start of each minute
- EXCEPT every 10th minute (00, 10, 20, 30, 40, 50)
- This keeps timecode aligned with real-world time

### Drop-Frame Format
- **Non-drop frame**: `HH:MM:SS:FF` (uses colons)
- **Drop-frame**: `HH:MM:SS;FF` (uses semicolon before frames)

### Auto-Detection
The library provides smart auto-detection for drop-frame:

**When parsing timecodes:**
```js
// Drop-frame format is auto-detected from semicolon
timecodeToSeconds('01:00:00;00', 29.97) // 3600.00 seconds (drop-frame)
timecodeToSeconds('01:00:00:00', 29.97) // 3600.00 seconds (non-drop)
```

**When generating timecodes:**
```js
// For 29.97/59.94 fps, drop-frame is auto-selected for durations ≥ 1 minute
secondsToTimecode(3600, 29.97)    // '01:00:00;00' (auto drop-frame)
secondsToTimecode(30, 29.97)      // '00:00:30:00' (auto non-drop)
secondsToTimecode(3600, 29.97, false) // '01:00:00:00' (force non-drop)
```

### Generating Drop-Frame Timecode
```js
// Generate drop-frame format with third parameter
secondsToTimecode(3600, 29.97, true)  // '01:00:00;00'
secondsToTimecode(3600, 29.97, false) // '01:00:00:00'
secondsToTimecode(3600, 29.97)        // '01:00:00:00' (default: non-drop)
```

### Supported Frame Rates
Drop-frame is only valid for:
- **29.97 fps** - Standard NTSC (drops 2 frames/minute)
- **59.94 fps** - Double-rate NTSC (drops 4 frames/minute)

Other frame rates (24, 25, 30, etc.) will ignore the drop-frame parameter.

### Usage Warnings
The library will warn you about potentially incorrect usage:

1. **Using drop-frame format with wrong frame rate:**
   ```js
   timecodeToSeconds('01:00:00;00', 25)
   // ⚠️ Warning: Drop-frame timecode format used with non-drop-frame rate 25 fps
   ```

2. **Using 29.97/59.94 fps without drop-frame for long durations:**
   ```js
   secondsToTimecode(3600, 29.97, false)
   // ⚠️ Warning: For durations over 1 hour, consider using drop-frame format
   // After 1 hour(s), drift is approximately 4 seconds
   ```

## System Architecture

<!-- _High level overview of system architecture_ -->

A node module 

<!-- ## Documentation

There's a [docs](./docs) folder in this repository.

[docs/notes](./docs/notes) contains dev draft notes on various aspects of the project. This would generally be converted either into ADRs or guides when ready.

[docs/adr](./docs/adr) contains [Architecture Decision Record](https://github.com/joelparkerhenderson/architecture_decision_record).

> An architectural decision record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

We are using [this template for ADR](https://gist.github.com/iaincollins/92923cc2c309c2751aea6f1b34b31d95) -->

## Development env

 _How to run the development environment_ -->

- npm > `6.1.0`
- [Node 12](https://nodejs.org/docs/latest-v12.x/api/)

Node version is set in node version manager [`.nvmrc`](https://github.com/creationix/nvm#nvmrc)

```
nvm use
```


<!-- _Coding style convention ref optional, eg which linter to use_ -->

<!-- _Linting, github pre-push hook - optional_ -->

## Build

<!-- _How to run build_ -->

```
pnpm build
```

This creates dual format builds in the `dist` folder:
- CommonJS (.js) 
- ESM (.mjs)
- TypeScript definitions (.d.ts)
## Tests

<!-- _How to carry out tests_ -->

```
pnpm test
```

Tests are now using [Vitest](https://vitest.dev/) for a modern testing experience.


## Deployment

<!-- _How to deploy the code/app into test/staging/production_ -->

To publish to npm 
```
pnpm publish:public
```
and for pre-flight checks 🔦🛫 
```
pnpm publish:dry:run
```