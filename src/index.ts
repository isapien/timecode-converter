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
 * @returns Time in seconds
 * @todo could be refactored with some helper functions for clarity
 */
const timecodeToSeconds = (time: string | number): Seconds => {
  if (typeof time === "string") {
    const resultPadded = padTimeToTimecode(time)
    if (typeof resultPadded === "string") {
      const resultConverted = timecodeToSecondsHelper(resultPadded)
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
 * @returns Timecode in format hh:mm:ss
 */
const shortTimecode = (time: number | string): string => {
  // handle edge case if it's zero, then just return shorter timecode
  if (time === 0) {
    return "00:00:00"
  } else {
    const seconds = typeof time === "string" ? timecodeToSeconds(time) : time
    const timecode = secondsToTimecode(seconds)
    return timecode.slice(0, -3)
  }
}

export { secondsToTimecode, timecodeToSeconds, shortTimecode }
export type { Seconds, TimecodeFormat, FrameRate, TimecodeOptions } from "./types"
