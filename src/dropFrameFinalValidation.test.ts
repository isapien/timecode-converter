import { describe, it, expect } from "vitest"
import { timecodeToSeconds, secondsToTimecode } from "./index"
import { framesToDropFrameTimecode, dropFrameTimecodeToFrames } from "./dropFrameHelpers"
import TimecodeClass from "smpte-timecode"

describe("Final drop-frame validation against smpte-timecode", () => {
  describe("29.97 fps drop-frame validation", () => {
    // Comprehensive test of various second values
    const testCases = [
      { seconds: 0, frames: 0, expected: "00:00:00;00" },
      { seconds: 1, frames: 30, expected: "00:00:01;00" },
      { seconds: 30, frames: 899, expected: "00:00:29;29" },
      { seconds: 59, frames: 1768, expected: "00:00:58;28" },
      { seconds: 60, frames: 1798, expected: "00:00:59;28" },
      { seconds: 60.06, frames: 1800, expected: "00:01:00;02" },
      { seconds: 90, frames: 2697, expected: "00:01:29;29" },
      { seconds: 120, frames: 3596, expected: "00:01:59;28" },
      { seconds: 180, frames: 5395, expected: "00:02:59;29" },
      { seconds: 240, frames: 7193, expected: "00:03:59;29" },
      { seconds: 300, frames: 8991, expected: "00:04:59;29" },
      { seconds: 360, frames: 10789, expected: "00:05:59;29" },
      { seconds: 420, frames: 12587, expected: "00:06:59;29" },
      { seconds: 480, frames: 14386, expected: "00:08:00;02" },
      { seconds: 540, frames: 16184, expected: "00:09:00;02" },
      { seconds: 600, frames: 17982, expected: "00:10:00;00" },
      { seconds: 900, frames: 26973, expected: "00:14:59;29" },
      { seconds: 1200, frames: 35964, expected: "00:20:00;00" },
      { seconds: 1800, frames: 53946, expected: "00:30:00;00" },
      { seconds: 2700, frames: 80919, expected: "00:44:59;29" },
      { seconds: 3600, frames: 107892, expected: "01:00:00;00" },
      { seconds: 7200, frames: 215784, expected: "02:00:00;00" },
    ]

    testCases.forEach(({ seconds, frames, expected }) => {
      it(`Should match SMPTE for ${seconds} seconds (${frames} frames) = ${expected}`, () => {
        // Test our secondsToTimecode
        const ourResult = secondsToTimecode(seconds, 29.97, true)

        // Verify with SMPTE
        const smpteTC = new TimecodeClass(frames, 29.97, true)
        const smpteResult = smpteTC.toString().replace(",", ";")

        expect(ourResult).toEqual(expected)
        expect(smpteResult).toEqual(expected)
        expect(ourResult).toEqual(smpteResult)
      })
    })
  })

  describe("59.94 fps drop-frame validation", () => {
    const testCases = [
      { seconds: 0, frames: 0, expected: "00:00:00;00" },
      { seconds: 1, frames: 60, expected: "00:00:01;00" },
      { seconds: 60, frames: 3596, expected: "00:00:59;56" },
      { seconds: 120, frames: 7193, expected: "00:01:59;57" },
      { seconds: 600, frames: 35964, expected: "00:10:00;00" },
      { seconds: 3600, frames: 215784, expected: "01:00:00;00" },
    ]

    testCases.forEach(({ seconds, frames, expected }) => {
      it(`Should match SMPTE for ${seconds} seconds at 59.94 fps = ${expected}`, () => {
        const ourResult = secondsToTimecode(seconds, 59.94, true)
        const smpteTC = new TimecodeClass(frames, 59.94, true)
        const smpteResult = smpteTC.toString().replace(",", ";")

        expect(ourResult).toEqual(expected)
        expect(smpteResult).toEqual(expected)
        expect(ourResult).toEqual(smpteResult)
      })
    })
  })

  describe("Helper function validation", () => {
    it("Should validate framesToDropFrameTimecode against SMPTE", () => {
      const testFrames = [0, 30, 1798, 1800, 3596, 17982, 107892]

      testFrames.forEach((frames) => {
        const ourResult = framesToDropFrameTimecode(frames, 29.97)
        const smpteTC = new TimecodeClass(frames, 29.97, true)
        const smpteStr = smpteTC.toString()

        // SMPTE uses semicolon for drop-frame
        const parts = smpteStr.split(/[:;]/)
        const h = parseInt(parts[0], 10) || 0
        const m = parseInt(parts[1], 10) || 0
        const s = parseInt(parts[2], 10) || 0
        const f = parseInt(parts[3], 10) || 0

        expect(ourResult.hours).toEqual(h)
        expect(ourResult.minutes).toEqual(m)
        expect(ourResult.seconds).toEqual(s)
        expect(ourResult.frames).toEqual(f)
      })
    })
  })

  describe("Round-trip validation", () => {
    const timecodes = [
      "00:00:00;00",
      "00:00:59;28",
      "00:01:00;02",
      "00:10:00;00",
      "01:00:00;00",
      "00:05:23;17",
      "00:15:45;22",
    ]

    timecodes.forEach((timecode) => {
      it(`Should round-trip ${timecode} correctly`, () => {
        // Convert to seconds
        const seconds = timecodeToSeconds(timecode, 29.97)

        // Convert back
        const backToTimecode = secondsToTimecode(seconds, 29.97, true)

        expect(backToTimecode).toEqual(timecode)
      })
    })
  })

  describe("Auto-detection validation", () => {
    it("Should auto-detect drop-frame for durations >= 1 minute", () => {
      // Should use drop-frame automatically
      expect(secondsToTimecode(60, 29.97)).toEqual("00:00:59;28")
      expect(secondsToTimecode(300, 29.97)).toEqual("00:04:59;29")
      expect(secondsToTimecode(3600, 29.97)).toEqual("01:00:00;00")
    })

    it("Should auto-detect non-drop for durations < 1 minute", () => {
      // Should use non-drop automatically
      expect(secondsToTimecode(30, 29.97)).toEqual("00:00:30:00")
      expect(secondsToTimecode(45, 29.97)).toEqual("00:00:44:29")
      expect(secondsToTimecode(59, 29.97)).toEqual("00:00:58:29")
    })

    it("Should respect explicit drop-frame parameter", () => {
      // Force drop-frame for short duration
      expect(secondsToTimecode(30, 29.97, true)).toEqual("00:00:29;29")

      // Force non-drop for long duration
      expect(secondsToTimecode(3600, 29.97, false)).toEqual("01:00:00:00")
    })
  })

  describe("Edge cases", () => {
    it("Should handle fractional seconds correctly", () => {
      const tests = [
        { seconds: 1.5, frames: 45, expected: "00:00:01;15" },
        { seconds: 59.967, frames: 1797, expected: "00:00:59;27" },
        { seconds: 60.033, frames: 1799, expected: "00:00:59;29" },
      ]

      tests.forEach(({ seconds, frames, expected }) => {
        const ourResult = secondsToTimecode(seconds, 29.97, true)
        const smpteTC = new TimecodeClass(frames, 29.97, true)
        const smpteResult = smpteTC.toString().replace(",", ";")

        expect(ourResult).toEqual(expected)
        expect(smpteResult).toEqual(expected)
      })
    })

    it("Should handle very long durations", () => {
      // 24 hours
      const hours24 = 86400
      const frames24 = Math.round(hours24 * 29.97)
      const ourResult = secondsToTimecode(hours24, 29.97, true)

      // SMPTE might wrap at 24 hours, but we don't
      expect(ourResult).toEqual("24:00:00;00")
    })
  })
})
