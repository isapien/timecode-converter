import { describe, it, expect } from "vitest"
import { timecodeToSeconds, secondsToTimecode } from "./index"
import TimecodeClass from "smpte-timecode"

describe("Drop-frame comparison with smpte-timecode", () => {
  describe("Seconds to drop-frame timecode", () => {
    const testCases = [
      { seconds: 1, description: "1 second" },
      { seconds: 30, description: "30 seconds" },
      { seconds: 60, description: "1 minute boundary" },
      { seconds: 90, description: "1.5 minutes" },
      { seconds: 120, description: "2 minute boundary" },
      { seconds: 300, description: "5 minutes" },
      { seconds: 600, description: "10 minutes (no drop)" },
      { seconds: 900, description: "15 minutes" },
      { seconds: 1200, description: "20 minutes (no drop)" },
      { seconds: 1800, description: "30 minutes (no drop)" },
      { seconds: 2700, description: "45 minutes" },
      { seconds: 3600, description: "1 hour (no drop)" },
      { seconds: 7200, description: "2 hours (no drop)" },
    ]

    testCases.forEach(({ seconds, description }) => {
      it(`Should match smpte-timecode for ${description}`, () => {
        // Our implementation
        const ourResult = secondsToTimecode(seconds, 29.97, true)

        // smpte-timecode
        const smpteFrames = Math.round(seconds * 29.97)
        const smpteTC = new TimecodeClass(smpteFrames, 29.97, true)
        const smpteResult = smpteTC.toString().replace(",", ";")

        expect(ourResult).toEqual(smpteResult)
      })
    })
  })

  describe("Round-trip conversion accuracy", () => {
    // Test that our conversions match smpte-timecode when doing round trips
    const testSeconds = [30, 60.06, 120.12, 600, 1800, 3600, 300.33, 900.5, 2700.8]

    testSeconds.forEach((seconds) => {
      it(`Should round-trip correctly for ${seconds} seconds`, () => {
        // Convert seconds to timecode
        const ourTimecode = secondsToTimecode(seconds, 29.97, true)

        // Convert back to seconds
        const ourSecondsBack = timecodeToSeconds(ourTimecode, 29.97)

        // Compare with smpte-timecode
        const smpteFrames = Math.round(seconds * 29.97)
        const smpteTC = new TimecodeClass(smpteFrames, 29.97, true)
        const smpteTimecode = smpteTC.toString().replace(",", ";")

        // Our timecode should match smpte's
        expect(ourTimecode).toEqual(smpteTimecode)

        // And the round-trip should be accurate (within floating point tolerance)
        expect(Math.abs(ourSecondsBack - seconds)).toBeLessThan(0.04) // ~1 frame tolerance
      })
    })
  })

  describe("Frame boundary cases", () => {
    it("Should handle frame transitions around minute boundaries correctly", () => {
      // Test frames around the 1-minute boundary
      const testFrames = [1796, 1797, 1798, 1799, 1800, 1801, 1802]

      testFrames.forEach((frameNum) => {
        const seconds = frameNum / 29.97
        const ourResult = secondsToTimecode(seconds, 29.97, true)

        const smpteTC = new TimecodeClass(frameNum, 29.97, true)
        const smpteResult = smpteTC.toString().replace(",", ";")

        expect(ourResult).toEqual(smpteResult)
      })
    })

    it("Should handle frame transitions around 2-minute boundary correctly", () => {
      // Test frames around the 2-minute boundary
      const testFrames = [3594, 3595, 3596, 3597, 3598, 3599, 3600]

      testFrames.forEach((frameNum) => {
        const seconds = frameNum / 29.97
        const ourResult = secondsToTimecode(seconds, 29.97, true)

        const smpteTC = new TimecodeClass(frameNum, 29.97, true)
        const smpteResult = smpteTC.toString().replace(",", ";")

        expect(ourResult).toEqual(smpteResult)
      })
    })
  })

  describe("59.94 fps drop-frame", () => {
    it("Should match smpte-timecode for 59.94 fps", () => {
      const testCases = [
        { seconds: 60, description: "1 minute" },
        { seconds: 120, description: "2 minutes" },
        { seconds: 600, description: "10 minutes" },
      ]

      testCases.forEach(({ seconds, description }) => {
        // Our implementation
        const ourResult = secondsToTimecode(seconds, 59.94, true)

        // smpte-timecode
        const smpteFrames = Math.round(seconds * 59.94)
        const smpteTC = new TimecodeClass(smpteFrames, 59.94, true)
        const smpteResult = smpteTC.toString().replace(",", ";")

        expect(ourResult).toEqual(smpteResult)
      })
    })
  })
})
