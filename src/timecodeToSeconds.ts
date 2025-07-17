import type { TimecodeFormat, FrameRate, Seconds } from "./types"

/**
 * Helper function
 * @param tc - Timecode string
 * @param fps - Frames per second
 * @returns Total number of frames
 */
const timecodeToFrames = (tc: TimecodeFormat, fps: FrameRate): number => {
  // TODO make 29.97 fps drop-frame aware - works for 25 only.

  const parts = tc.split(":")
  let frames = parseInt(parts[3]!, 10)
  frames += parseInt(parts[2]!, 10) * fps
  frames += parseInt(parts[1]!, 10) * (fps * 60)
  frames += parseInt(parts[0]!, 10) * (fps * 60 * 60)

  return frames
}

/**
 * Convert broadcast timecodes to seconds
 * @param tc - Timecode in format `hh:mm:ss:ff`
 * @param frameRate - Frames per second (defaults to 25 if not provided)
 * @returns Time in seconds
 */
const timecodeToSecondsHelper = (tc: TimecodeFormat, frameRate?: FrameRate): Seconds => {
  const fps = frameRate ?? 25
  const frames = timecodeToFrames(tc, fps)

  return Number((frames / fps).toFixed(2))
}

export default timecodeToSecondsHelper
