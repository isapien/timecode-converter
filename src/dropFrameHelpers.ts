import type { FrameRate } from "./types"

/**
 * Check if a timecode string is in drop-frame format
 * Drop-frame timecodes use semicolon before frames: hh:mm:ss;ff
 */
export const isDropFrameTimecode = (tc: string): boolean => {
  return tc.includes(";")
}

/**
 * Check if a frame rate supports drop-frame
 * Only 29.97 and 59.94 fps support drop-frame in SMPTE standard
 */
export const isDropFrameRate = (fps: FrameRate): boolean => {
  return Math.abs(fps - 29.97) < 0.01 || Math.abs(fps - 59.94) < 0.01
}

/**
 * Calculate the number of frames to drop for drop-frame timecode
 * SMPTE standard: Drop 2 frames per minute for 29.97, 4 frames for 59.94
 * Except every 10th minute (00, 10, 20, 30, 40, 50)
 */
export const calculateDroppedFrames = (hours: number, minutes: number, frameRate: FrameRate): number => {
  if (!isDropFrameRate(frameRate)) return 0

  const dropFramesPerMinute = Math.abs(frameRate - 29.97) < 0.01 ? 2 : 4
  const totalMinutes = hours * 60 + minutes

  // Calculate minutes where frames are dropped
  // Every minute drops frames except every 10th minute
  const droppedMinutes = totalMinutes - Math.floor(totalMinutes / 10)

  return droppedMinutes * dropFramesPerMinute
}

/**
 * Convert drop-frame timecode to total frames
 * Accounts for the dropped frame numbers in the calculation
 */
export const dropFrameTimecodeToFrames = (
  hours: number,
  minutes: number,
  seconds: number,
  frames: number,
  frameRate: FrameRate,
): number => {
  // Calculate nominal frames (as if no frames were dropped)
  const nominalFps = Math.round(frameRate)
  let totalFrames = frames
  totalFrames += seconds * nominalFps
  totalFrames += minutes * nominalFps * 60
  totalFrames += hours * nominalFps * 60 * 60

  // Subtract the dropped frames
  const droppedFrames = calculateDroppedFrames(hours, minutes, frameRate)

  return totalFrames - droppedFrames
}

/**
 * Convert frame count to drop-frame timecode components
 * This reverses the drop-frame calculation
 */
export const framesToDropFrameTimecode = (
  frameCount: number,
  frameRate: FrameRate,
): { hours: number; minutes: number; seconds: number; frames: number } => {
  const nominalFps = Math.round(frameRate)
  const dropFramesPerMinute = Math.abs(frameRate - 29.97) < 0.01 ? 2 : 4

  // Calculate how many frames per minute (accounting for drops)
  const actualFramesPerMinute = nominalFps * 60 - dropFramesPerMinute
  // Frames in a 10-minute segment (9 minutes with drops, 1 without)
  const framesPer10Minutes = actualFramesPerMinute * 9 + nominalFps * 60

  // Calculate which 10-minute segment we're in
  const tenMinuteSegments = Math.floor(frameCount / framesPer10Minutes)
  let remainingFrames = frameCount % framesPer10Minutes

  // Calculate additional minutes within the 10-minute segment
  let additionalMinutes = 0
  if (remainingFrames >= nominalFps * 60) {
    // We're past the first minute (which has no drops in each 10-min segment)
    remainingFrames -= nominalFps * 60
    additionalMinutes = 1 + Math.floor(remainingFrames / actualFramesPerMinute)
    remainingFrames = remainingFrames % actualFramesPerMinute
  }

  // Calculate total time components
  const totalMinutes = tenMinuteSegments * 10 + additionalMinutes
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  // For display purposes, we need to add back the dropped frames
  // when we're in a minute that has drops
  let displayFrames = remainingFrames
  if (minutes % 10 !== 0 && additionalMinutes > 0) {
    // We're in a minute with drops, add them back for display
    displayFrames += dropFramesPerMinute
  }

  const seconds = Math.floor(displayFrames / nominalFps)
  const frames = displayFrames % nominalFps

  return { hours, minutes, seconds, frames }
}
