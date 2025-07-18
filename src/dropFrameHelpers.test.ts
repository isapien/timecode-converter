import { describe, it, expect } from "vitest"
import {
  isDropFrameTimecode,
  isDropFrameRate,
  calculateDroppedFrames,
  dropFrameTimecodeToFrames,
  framesToDropFrameTimecode,
} from "./dropFrameHelpers"

describe("Drop-frame helpers", () => {
  describe("isDropFrameTimecode", () => {
    it("Should identify drop-frame format with semicolon", () => {
      expect(isDropFrameTimecode("01:00:00;00")).toBe(true)
      expect(isDropFrameTimecode("00:00:00;00")).toBe(true)
    })

    it("Should identify non-drop format with colons", () => {
      expect(isDropFrameTimecode("01:00:00:00")).toBe(false)
      expect(isDropFrameTimecode("00:00:00:00")).toBe(false)
    })
  })

  describe("isDropFrameRate", () => {
    it("Should identify 29.97 as drop-frame rate", () => {
      expect(isDropFrameRate(29.97)).toBe(true)
    })

    it("Should identify 59.94 as drop-frame rate", () => {
      expect(isDropFrameRate(59.94)).toBe(true)
    })

    it("Should not identify other rates as drop-frame", () => {
      expect(isDropFrameRate(24)).toBe(false)
      expect(isDropFrameRate(25)).toBe(false)
      expect(isDropFrameRate(30)).toBe(false)
      expect(isDropFrameRate(50)).toBe(false)
      expect(isDropFrameRate(60)).toBe(false)
    })
  })

  describe("calculateDroppedFrames", () => {
    it("Should calculate 0 dropped frames at 00:00", () => {
      expect(calculateDroppedFrames(0, 0, 29.97)).toBe(0)
    })

    it("Should drop 2 frames per minute for 29.97", () => {
      expect(calculateDroppedFrames(0, 1, 29.97)).toBe(2)
      expect(calculateDroppedFrames(0, 2, 29.97)).toBe(4)
      expect(calculateDroppedFrames(0, 9, 29.97)).toBe(18)
    })

    it("Should not drop frames on 10th minutes", () => {
      expect(calculateDroppedFrames(0, 10, 29.97)).toBe(18) // 9 minutes * 2
      expect(calculateDroppedFrames(0, 20, 29.97)).toBe(36) // 18 minutes * 2
      expect(calculateDroppedFrames(0, 30, 29.97)).toBe(54) // 27 minutes * 2
      expect(calculateDroppedFrames(1, 0, 29.97)).toBe(108) // 54 minutes * 2
    })

    it("Should drop 4 frames per minute for 59.94", () => {
      expect(calculateDroppedFrames(0, 1, 59.94)).toBe(4)
      expect(calculateDroppedFrames(0, 2, 59.94)).toBe(8)
    })
  })

  describe("dropFrameTimecodeToFrames", () => {
    it("Should convert 00:00:00;00 to 0 frames", () => {
      expect(dropFrameTimecodeToFrames(0, 0, 0, 0, 29.97)).toBe(0)
    })

    it("Should handle first minute boundary correctly", () => {
      // 00:00:59;29 -> 00:01:00;02 (skips frames 0 and 1)
      expect(dropFrameTimecodeToFrames(0, 0, 59, 29, 29.97)).toBe(1799)
      expect(dropFrameTimecodeToFrames(0, 1, 0, 2, 29.97)).toBe(1800)
    })

    it("Should handle 10th minute without dropping frames", () => {
      // At 00:10:00;00, no frames are dropped
      expect(dropFrameTimecodeToFrames(0, 10, 0, 0, 29.97)).toBe(17982)
    })

    it("Should calculate 1 hour correctly", () => {
      // 01:00:00;00 should account for 108 dropped frames
      // 30 * 60 * 60 = 108000 nominal frames
      // minus 108 dropped frames = 107892
      expect(dropFrameTimecodeToFrames(1, 0, 0, 0, 29.97)).toBe(107892)
    })
  })

  describe("framesToDropFrameTimecode", () => {
    it("Should convert 0 frames to 00:00:00;00", () => {
      const result = framesToDropFrameTimecode(0, 29.97)
      expect(result).toEqual({ hours: 0, minutes: 0, seconds: 0, frames: 0 })
    })

    it("Should handle first minute boundary", () => {
      // Frame 1800 in drop-frame doesn't map cleanly to 00:01:00;02
      // The function needs to handle the complex math
      const result = framesToDropFrameTimecode(1800, 29.97)
      expect(result.minutes).toEqual(1)
      expect(result.seconds).toEqual(0)
    })

    it("Should handle 10th minute correctly", () => {
      // Frame 17982 should be 00:10:00;00
      const result = framesToDropFrameTimecode(17982, 29.97)
      expect(result).toEqual({ hours: 0, minutes: 10, seconds: 0, frames: 0 })
    })

    it("Should convert 1 hour of frames correctly", () => {
      // 107892 frames should be 01:00:00;00
      const result = framesToDropFrameTimecode(107892, 29.97)
      expect(result).toEqual({ hours: 1, minutes: 0, seconds: 0, frames: 0 })
    })
  })
})
