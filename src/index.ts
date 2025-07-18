/**
 * Wrapping around "time stamps" and timecode conversion modules
 * To provide more support for variety of formats.
 */
import secondsToTimecode from "./secondsToTimecode"
import timecodeToSecondsHelper from "./timecodeToSeconds"
import padTimeToTimecode from "./padTimeToTimecode"
import type { Seconds } from "./types"

/**
 * Convert various time formats to seconds
 * @param time - Can take as input timecodes in the following formats:
 * - hh:mm:ss:ff
 * - mm:ss
 * - m:ss
 * - ss - seconds --> if it's already in seconds then it just returns seconds
 * - hh:mm:ff
 * - m.ss
 * @param frameRate - Frames per second (must be specified for timecode strings)
 * @returns Time in seconds
 * @todo could be refactored with some helper functions for clarity
 */
const timecodeToSeconds = (time: string | number, frameRate?: number): Seconds => {
  if (typeof time === "string") {
    if (frameRate === undefined) {
      throw new Error("Frame rate must be specified when converting timecode strings to seconds")
    }
    const resultPadded = padTimeToTimecode(time)
    if (typeof resultPadded === "string") {
      const resultConverted = timecodeToSecondsHelper(resultPadded, frameRate)
      return resultConverted
    }
    // This shouldn't happen based on current logic, but for type safety
    return resultPadded
  }

  // assuming it receives timecode as seconds as number
  return parseFloat(String(time))
}

/**
 * Get shortened timecode without frames
 * @param time - Time in seconds or timecode format
 * @param frameRate - Frames per second (required)
 * @param dropFrame - Generate drop-frame format (auto-detected from input format if string)
 * @returns Timecode in format hh:mm:ss
 */
const shortTimecode = (time: number | string, frameRate: number, dropFrame?: boolean): string => {
  // handle edge case if it's zero, then just return shorter timecode
  if (time === 0) {
    return "00:00:00"
  } else {
    // Auto-detect drop-frame from input format if not specified
    const useDropFrame = dropFrame !== undefined ? dropFrame : typeof time === "string" && time.includes(";")

    const seconds = typeof time === "string" ? timecodeToSeconds(time, frameRate) : time
    const timecode = secondsToTimecode(seconds, frameRate, useDropFrame)
    return timecode.slice(0, -3)
  }
}

// Export main functions
export { secondsToTimecode, timecodeToSeconds, shortTimecode }

// Export validation function
export { validateTimecode } from "./validateTimecode"
export type { TimecodeValidationResult } from "./validateTimecode"

// Export drop-frame helpers for advanced users
export { isDropFrameTimecode, isDropFrameRate } from "./dropFrameHelpers"

// Export types
export type { Seconds, TimecodeFormat, FrameRate, TimecodeOptions } from "./types"
