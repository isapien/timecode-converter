import type { TimecodeFormat, FrameRate, Seconds } from "./types"
import { isDropFrameTimecode, isDropFrameRate, dropFrameTimecodeToFrames } from "./dropFrameHelpers"

/**
 * Parse timecode string into components
 * Handles both drop-frame (semicolon) and non-drop (colon) formats
 */
const parseTimecode = (
  tc: TimecodeFormat,
): { hours: number; minutes: number; seconds: number; frames: number; isDropFrame: boolean } => {
  const isDropFrame = isDropFrameTimecode(tc)
  // Normalize format for parsing (replace semicolon with colon)
  const normalized = tc.replace(";", ":")
  const parts = normalized.split(":")

  return {
    hours: parseInt(parts[0]!, 10),
    minutes: parseInt(parts[1]!, 10),
    seconds: parseInt(parts[2]!, 10),
    frames: parseInt(parts[3]!, 10),
    isDropFrame,
  }
}

/**
 * Helper function for non-drop frame calculations
 * @param tc - Timecode string
 * @param fps - Frames per second
 * @returns Total number of frames
 */
const timecodeToFrames = (tc: TimecodeFormat, fps: FrameRate): number => {
  const { hours, minutes, seconds, frames, isDropFrame } = parseTimecode(tc)

  if (isDropFrame && isDropFrameRate(fps)) {
    // Use drop-frame calculation
    return dropFrameTimecodeToFrames(hours, minutes, seconds, frames, fps)
  }

  // Non-drop frame calculation
  let totalFrames = frames
  totalFrames += seconds * fps
  totalFrames += minutes * fps * 60
  totalFrames += hours * fps * 60 * 60

  return totalFrames
}

/**
 * Convert broadcast timecodes to seconds
 * @param tc - Timecode in format:
 *   - Non-drop: `hh:mm:ss:ff` (colons)
 *   - Drop-frame: `hh:mm:ss;ff` (semicolon before frames)
 * @param frameRate - Frames per second (required)
 * @returns Time in seconds
 *
 * Drop-frame is auto-detected from format:
 * - Semicolon (;) = drop-frame calculation
 * - Colon (:) = non-drop frame calculation
 */
const timecodeToSecondsHelper = (tc: TimecodeFormat, frameRate: FrameRate): Seconds => {
  const fps = frameRate

  // Warn if using drop-frame format with non-drop-frame rates
  if (isDropFrameTimecode(tc) && !isDropFrameRate(fps)) {
    console.warn(
      `Warning: Drop-frame timecode format (${tc}) used with non-drop-frame rate ${fps} fps. ` +
        `Drop-frame is only valid for 29.97 and 59.94 fps.`,
    )
  }

  const frames = timecodeToFrames(tc, fps)

  return Number((frames / fps).toFixed(2))
}

export default timecodeToSecondsHelper
