import type { TimecodeFormat, FrameRate } from "./types"
import { isDropFrameTimecode, isDropFrameRate } from "./dropFrameHelpers"

export interface TimecodeValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  format?: "drop-frame" | "non-drop"
  components?: {
    hours: number
    minutes: number
    seconds: number
    frames: number
  }
}

/**
 * Validate a timecode string and provide detailed feedback
 * @param timecode - Timecode string to validate
 * @param frameRate - Frame rate to validate against (optional)
 * @returns Validation result with errors, warnings, and parsed components
 * @example
 * validateTimecode("01:00:00;00", 29.97)
 * // { valid: true, format: "drop-frame", components: {...} }
 *
 * validateTimecode("25:00:00:00", 25)
 * // { valid: false, errors: ["Hours cannot exceed 23"] }
 *
 * validateTimecode("00:00:00;00", 25)
 * // { valid: true, warnings: ["Drop-frame format used with non-drop-frame rate 25 fps"] }
 */
export function validateTimecode(timecode: TimecodeFormat, frameRate?: FrameRate): TimecodeValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check basic format
  const dropFrameFormat = isDropFrameTimecode(timecode)
  const format = dropFrameFormat ? "drop-frame" : "non-drop"

  // Normalize semicolon to colon for parsing
  const normalized = timecode.replace(";", ":")
  const parts = normalized.split(":")

  // Check part count
  if (parts.length !== 4) {
    errors.push(`Invalid timecode format. Expected hh:mm:ss:ff or hh:mm:ss;ff, got ${timecode}`)
    return { valid: false, errors, warnings }
  }

  // Parse components with null checks
  const hours = parts[0] ? parseInt(parts[0], 10) : NaN
  const minutes = parts[1] ? parseInt(parts[1], 10) : NaN
  const seconds = parts[2] ? parseInt(parts[2], 10) : NaN
  const frames = parts[3] ? parseInt(parts[3], 10) : NaN

  // Validate ranges
  if (isNaN(hours) || hours < 0) {
    errors.push("Hours must be a valid non-negative number")
  } else if (hours > 23) {
    errors.push("Hours cannot exceed 23")
  }

  if (isNaN(minutes) || minutes < 0) {
    errors.push("Minutes must be a valid non-negative number")
  } else if (minutes > 59) {
    errors.push("Minutes cannot exceed 59")
  }

  if (isNaN(seconds) || seconds < 0) {
    errors.push("Seconds must be a valid non-negative number")
  } else if (seconds > 59) {
    errors.push("Seconds cannot exceed 59")
  }

  if (isNaN(frames) || frames < 0) {
    errors.push("Frames must be a valid non-negative number")
  }

  // Frame rate specific validation
  if (frameRate !== undefined) {
    const maxFrames = Math.round(frameRate) - 1
    if (frames > maxFrames) {
      errors.push(`Frames cannot exceed ${maxFrames} for ${frameRate} fps`)
    }

    // Drop-frame specific validation
    if (dropFrameFormat) {
      if (!isDropFrameRate(frameRate)) {
        warnings.push(
          `Drop-frame format used with non-drop-frame rate ${frameRate} fps. Drop-frame is only valid for 29.97 and 59.94 fps.`,
        )
      } else {
        // Check for invalid drop-frame timecodes
        // In drop-frame, frames 00 and 01 don't exist at minute boundaries (except every 10th minute)
        if (seconds === 0 && minutes % 10 !== 0 && frames < 2) {
          errors.push(`Invalid drop-frame timecode. Frames 00 and 01 don't exist at minute ${minutes}`)
        }
      }
    }
  }

  // Check for drop-frame format without frame rate
  if (dropFrameFormat && frameRate === undefined) {
    warnings.push("Drop-frame format detected but no frame rate provided for validation")
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    format,
    components: errors.length === 0 ? { hours, minutes, seconds, frames } : undefined,
  }
}
