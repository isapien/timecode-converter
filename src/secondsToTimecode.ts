import type { Seconds, FrameRate, TimecodeFormat } from "./types"

/**
 * Raised in this comment https://github.com/bbc/react-transcript-editor/pull/9
 * abstracted from https://github.com/bbc/newslabs-cdn/blob/master/js/20-bbcnpf.utils.js
 * In broadcast VIDEO, timecode is NOT hh:mm:ss:ms, it's hh:mm:ss:ff where ff is frames,
 * dependent on the framerate of the media concerned.
 * `hh:mm:ss:ff`
 */

/**
 * Helper function
 * Rounds to the 14milliseconds boundaries
 * Time in video can only "exist in" 14milliseconds boundaries.
 * This makes it possible for the HTML5 player to be frame accurate.
 */
const normalisePlayerTime = (seconds: Seconds, fps: FrameRate): number => {
  return Number(((1.0 / fps) * Math.floor(Number((fps * seconds).toPrecision(12)))).toFixed(2))
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
 * @param frameRate - Frames per second (defaults to 25 for PAL)
 * @returns Timecode in format hh:mm:ss:ff
 */
const secondsToTimecode = (seconds: Seconds, frameRate?: FrameRate): TimecodeFormat => {
  // handle edge case, trying to convert zero seconds
  if (seconds === 0) {
    return "00:00:00:00"
  }

  // written for PAL non-drop timecode
  const fps = frameRate ?? 25

  const normalisedSeconds = normalisePlayerTime(seconds, fps)

  const wholeSeconds = Math.floor(normalisedSeconds)
  const frames = (normalisedSeconds - wholeSeconds) * fps

  const hours = Math.floor(wholeSeconds / 3600)
  const minutes = Math.floor((wholeSeconds % 3600) / 60)
  const secs = wholeSeconds % 60

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}:${padZero(frames)}`
}

export default secondsToTimecode
