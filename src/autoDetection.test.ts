import { describe, it, expect } from "vitest"
import { secondsToTimecode, timecodeToSeconds } from "./index"

describe("Auto-detection features", () => {
  describe("secondsToTimecode auto-detection", () => {
    it("Should auto-detect drop-frame for long durations at 29.97 fps", () => {
      // >= 1 minute should use drop-frame
      expect(secondsToTimecode(60, 29.97)).toBe("00:00:59;28")
      expect(secondsToTimecode(120, 29.97)).toBe("00:01:59;28")
      expect(secondsToTimecode(600, 29.97)).toBe("00:10:00;00")
      expect(secondsToTimecode(3600, 29.97)).toBe("01:00:00;00")
    })

    it("Should auto-detect non-drop for short durations at 29.97 fps", () => {
      // < 1 minute should use non-drop
      expect(secondsToTimecode(30, 29.97)).toBe("00:00:30:00")
      expect(secondsToTimecode(45, 29.97)).toBe("00:00:44:29")
      expect(secondsToTimecode(59, 29.97)).toBe("00:00:58:29")
      expect(secondsToTimecode(59.9, 29.97)).toBe("00:00:59:26")
    })

    it("Should auto-detect drop-frame for long durations at 59.94 fps", () => {
      expect(secondsToTimecode(60, 59.94)).toBe("00:00:59;56")
      expect(secondsToTimecode(600, 59.94)).toBe("00:10:00;00")
    })

    it("Should never use drop-frame for non-drop-frame rates", () => {
      // Regardless of duration
      expect(secondsToTimecode(3600, 25)).toBe("01:00:00:00")
      expect(secondsToTimecode(3600, 24)).toBe("01:00:00:00")
      expect(secondsToTimecode(3600, 30)).toBe("01:00:00:00")
      expect(secondsToTimecode(3600, 50)).toBe("01:00:00:00")
      expect(secondsToTimecode(3600, 60)).toBe("01:00:00:00")
    })

    it("Should respect explicit drop-frame parameter over auto-detection", () => {
      // Force drop-frame for short duration
      expect(secondsToTimecode(30, 29.97, true)).toBe("00:00:29;29")

      // Force non-drop for long duration
      expect(secondsToTimecode(3600, 29.97, false)).toBe("01:00:00:00")

      // Explicit false for short duration (no change from auto)
      expect(secondsToTimecode(30, 29.97, false)).toBe("00:00:30:00")

      // Explicit true for long duration (no change from auto)
      expect(secondsToTimecode(3600, 29.97, true)).toBe("01:00:00;00")
    })
  })

  describe("timecodeToSeconds auto-detection", () => {
    it("Should auto-detect drop-frame from semicolon separator", () => {
      const dropFrameResult = timecodeToSeconds("01:00:00;00", 29.97)
      const nonDropResult = timecodeToSeconds("01:00:00:00", 29.97)

      // Both should be 3600 seconds
      expect(dropFrameResult).toBe(3600)
      expect(nonDropResult).toBe(3600)
    })

    it("Should handle drop-frame minute boundaries correctly", () => {
      // These are valid drop-frame timecodes
      expect(timecodeToSeconds("00:01:00;02", 29.97)).toBeCloseTo(60.06, 1)
      expect(timecodeToSeconds("00:02:00;04", 29.97)).toBeCloseTo(120.12, 1)

      // 10-minute boundaries don't drop frames
      expect(timecodeToSeconds("00:10:00;00", 29.97)).toBe(600)
    })
  })

  describe("Round-trip conversions with auto-detection", () => {
    it("Should maintain format through round-trip with auto-detection", () => {
      const testCases = [
        { seconds: 30, fps: 29.97, expected: "00:00:30:00" }, // Short, non-drop
        { seconds: 60, fps: 29.97, expected: "00:00:59;28" }, // Long, drop-frame
        { seconds: 3600, fps: 29.97, expected: "01:00:00;00" }, // Long, drop-frame
        { seconds: 3600, fps: 25, expected: "01:00:00:00" }, // Non-drop frame rate
      ]

      testCases.forEach(({ seconds, fps, expected }) => {
        const timecode = secondsToTimecode(seconds, fps)
        expect(timecode).toBe(expected)

        const backToSeconds = timecodeToSeconds(timecode, fps)
        expect(backToSeconds).toBeCloseTo(seconds, 1)
      })
    })
  })
})
