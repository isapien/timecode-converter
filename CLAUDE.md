# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview
This is a dependency-free timecode converter module written in TypeScript that can be used both client-side and server-side. It provides utilities for converting between broadcast timecodes (hh:mm:ss:ff format where ff is frames) and seconds.

## Project Structure
The module is structured as a modern TypeScript ES module with dual ESM/CJS builds:
- `src/index.ts` - Main entry point exporting three functions: `secondsToTimecode`, `timecodeToSeconds`, and `shortTimecode`
- `src/secondsToTimecode.ts` - Converts seconds to broadcast timecode format (hh:mm:ss:ff)
- `src/timecodeToSeconds.ts` - Converts broadcast timecode to seconds
- `src/padTimeToTimecode.ts` - Helper to normalize various time formats to standard timecode
- `src/types.ts` - TypeScript type definitions

## Common Commands

### Development
```bash
# Install dependencies (using pnpm)
pnpm install

# Run in watch mode
pnpm dev

# Type check without emitting
pnpm typecheck

# Format code
pnpm format
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests once (no watch)
pnpm test:run

# Run tests with coverage
pnpm test:coverage
```

### Building
```bash
# Build for production (creates dist/ with .js, .mjs, and .d.ts files)
pnpm build
```

### Publishing
```bash
# Publish to npm (public package)
pnpm publish:public

# Dry run to check what would be published
pnpm publish:dry:run
```

## Architecture Notes

### Timecode Format Support
The module accepts various input formats and normalizes them:
- `hh:mm:ss:ff` - Full broadcast timecode (e.g., "00:10:00:00")
- `hh:mm:ss` - Without frames (e.g., "00:10:00")
- `mm:ss` - Minutes and seconds (e.g., "10:00")
- `m:ss` - Single digit minutes (e.g., "9:00")
- `m.ss` - Dot notation (e.g., "9.01")
- `ss` - Just seconds as number or string

### Frame Rate Handling
- Default frame rate is 25 fps (PAL standard)
- Both `secondsToTimecode` and `timecodeToSeconds` accept an optional `framePerSeconds` parameter
- Frame-accurate conversion using normalisation to 14ms boundaries for HTML5 player compatibility
- Note: 29.97 fps drop-frame is not currently supported (see TODO in timecodeToSeconds.js)

### ES6 Module Configuration
- Uses native ES6 modules (`"type": "module"` in package.json)
- Tests require `NODE_OPTIONS=--experimental-vm-modules` flag for Jest compatibility
- All imports/exports use ES6 syntax

## Development Requirements
- Node.js 12+ (see `.nvmrc`)
- npm > 6.1.0