/**
 * Frame rate in frames per second
 * Common values: 24, 25, 29.97, 30, 50, 59.94
 * WARNING: 29.97 is treated as non-drop frame
 */
export type FrameRate = number

/**
 * Timecode string in format:
 * - Non-drop frame: hh:mm:ss:ff (colons)
 * - Drop-frame: hh:mm:ss;ff (semicolon before frames)
 */
export type TimecodeFormat = string

export type Seconds = number

export interface TimecodeOptions {
  frameRate?: FrameRate
}
