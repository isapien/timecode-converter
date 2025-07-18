import type { Seconds, FrameRate, TimecodeFormat } from "./types"
import { isDropFrameRate, framesToDropFrameTimecode } from "./dropFrameHelpers"

/**
 * Raised in this comment https://github.com/bbc/react-transcript-editor/pull/9
 * abstracted from https://github.com/bbc/newslabs-cdn/blob/master/js/20-bbcnpf.utils.js
 * In broadcast VIDEO, timecode is NOT hh:mm:ss:ms, it's hh:mm:ss:ff where ff is frames,
 * dependent on the framerate of the media concerned.
 * `hh:mm:ss:ff`
 */

/**
 * Helper function
 * Rounds to frame boundaries with proper floating-point precision handling
 * Time in video can only "exist in" frame boundaries.
 * This makes it possible for the HTML5 player to be frame accurate.
 */
const normalisePlayerTime = (seconds: Seconds, fps: FrameRate): number => {
  // Use high precision calculation to avoid floating-point errors
  const totalFrames = Math.floor(Number((fps * seconds).toPrecision(12)))
  return Number((totalFrames / fps).toFixed(2))
}

/**
 * Prepends zero - example pads 3 to 03
 */
const padZero = (n: number): string => {
  if (n < 10) return `0${Math.floor(n)}`
  return String(Math.floor(n))
}

/**
 * Convert seconds to broadcast timecode format
 * @param seconds - Time in seconds
 * @param frameRate - Frames per second (required)
 * @param dropFrame - Generate drop-frame format. If not specified:
 *   - For 29.97/59.94 fps: Uses drop-frame for durations ≥ 1 minute
 *   - For other frame rates: Always non-drop frame
 * @returns Timecode in format:
 *   - Non-drop: hh:mm:ss:ff (colons)
 *   - Drop-frame: hh:mm:ss;ff (semicolon before frames)
 * @example
 * secondsToTimecode(3600, 29.97) // "01:00:00;00" (auto drop-frame)
 * secondsToTimecode(30, 29.97) // "00:00:30:00" (auto non-drop for short duration)
 * secondsToTimecode(3600, 29.97, false) // "01:00:00:00" (forced non-drop)
 * secondsToTimecode(3600, 25) // "01:00:00:00" (always non-drop for PAL)
 */
const secondsToTimecode = (seconds: Seconds, frameRate: FrameRate, dropFrame?: boolean): TimecodeFormat => {
  // Determine if we should use drop-frame
  let useDropFrame: boolean

  if (dropFrame !== undefined) {
    // Explicit preference from user
    useDropFrame = dropFrame
  } else if (isDropFrameRate(frameRate)) {
    // Auto-detect based on duration for drop-frame rates
    // Use drop-frame for durations >= 1 minute to maintain accuracy
    useDropFrame = seconds >= 60
  } else {
    // Non-drop frame rates never use drop-frame
    useDropFrame = false
  }

  // Only warn if user explicitly chose non-drop frame for long durations
  if (dropFrame === false && isDropFrameRate(frameRate) && seconds >= 3600) {
    console.warn(
      `Warning: Converting ${seconds} seconds at ${frameRate} fps without drop-frame. ` +
        `For durations over 1 hour, consider using drop-frame format for accurate broadcast timecode. ` +
        `After ${Math.floor(seconds / 3600)} hour(s), drift is approximately ${Math.round((seconds / 3600) * 3.6)} seconds.`,
    )
  }

  // Check if this is a valid drop-frame scenario
  if (useDropFrame && isDropFrameRate(frameRate)) {
    // Calculate total frames for drop-frame
    const totalFrames = Math.round(seconds * frameRate)
    const { hours, minutes, seconds: secs, frames } = framesToDropFrameTimecode(totalFrames, frameRate)

    // Format with semicolon for drop-frame
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)};${padZero(frames)}`
  }

  // Non-drop frame calculation (original logic)
  // handle edge case, trying to convert zero seconds
  if (seconds === 0) {
    return "00:00:00:00"
  }

  const fps = frameRate
  const normalisedSeconds = normalisePlayerTime(seconds, fps)
  const wholeSeconds = Math.floor(normalisedSeconds)

  // Calculate frames with precision handling to avoid floating-point errors
  const framesPrecise = (normalisedSeconds - wholeSeconds) * fps
  const frames = Math.round(framesPrecise * 100) / 100 // Round to 2 decimal places before flooring

  const hours = Math.floor(wholeSeconds / 3600)
  const minutes = Math.floor((wholeSeconds % 3600) / 60)
  const secs = wholeSeconds % 60

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}:${padZero(frames)}`
}

export default secondsToTimecode
