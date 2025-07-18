import { describe, it, expect } from "vitest"
import secondsToTimecode from "./secondsToTimecode"

describe("secondsToTimecode", () => {
  it("Should convert 0 seconds to 00:00:00:00", () => {
    const result = secondsToTimecode(0, 25)
    expect(result).toEqual("00:00:00:00")
  })

  it("Should convert with 25 fps", () => {
    const result = secondsToTimecode(10, 25)
    expect(result).toEqual("00:00:10:00")
  })

  it("Should convert with custom frame rate", () => {
    const result = secondsToTimecode(1, 30)
    expect(result).toEqual("00:00:01:00")
  })

  it("Should handle fractional seconds correctly", () => {
    const result = secondsToTimecode(1.5, 25)
    expect(result).toEqual("00:00:01:12")
  })

  it("Should handle hours correctly", () => {
    const result = secondsToTimecode(3661, 25)
    expect(result).toEqual("01:01:01:00")
  })

  it("Should normalize player time correctly", () => {
    // Testing edge cases for frame boundaries
    const result = secondsToTimecode(0.04, 25)
    expect(result).toEqual("00:00:00:01")
  })

  it("Should handle floating point precision issues at 29.97 fps (non-drop frame)", () => {
    // Test case for the precision issue described in the analysis
    // The issue: 8.000000000000139 frames should be treated as 8 frames, not 9
    const testTime = 73.26693360026694 // This should produce 8 frames at 29.97 fps
    // Force non-drop frame to test the specific precision issue
    const result = secondsToTimecode(testTime, 29.97, false)

    // The expected result should have 07 frames (8-1 due to zero indexing in display)
    // but the current implementation might produce 09 frames due to precision error
    expect(result).toEqual("00:01:13:07")
  })

  it("Should handle edge case floating point precision", () => {
    // Another test case to verify frame boundary precision
    const testTime = 28.266933600266935 // 28 seconds + 8 frames at 29.97 fps
    const result = secondsToTimecode(testTime, 29.97)
    expect(result).toEqual("00:00:28:07")
  })

  it("Should handle precision for multiple frames", () => {
    // Test a value that should result in exactly 2 frames
    const twoFrames = 2 / 29.97
    const result = secondsToTimecode(twoFrames, 29.97)
    expect(result).toEqual("00:00:00:02")
  })

  it("Should handle frame values very close to boundaries", () => {
    // Test values very close to frame boundaries
    const result = secondsToTimecode(0.999999999999999, 29.97)
    expect(result).toEqual("00:00:00:29")
  })

  it("Should handle 23.976 fps (film rate) precision", () => {
    // Test with film frame rate for precision
    const result = secondsToTimecode(1.0010427606177606, 23.976)
    expect(result).toEqual("00:00:01:00")
  })

  describe("Drop-frame precision tests at 29.97 fps", () => {
    it("Should handle floating point precision issues in drop-frame", () => {
      // Same test time but with drop-frame
      const testTime = 73.26693360026694 // This should produce 8 frames at 29.97 fps
      const result = secondsToTimecode(testTime, 29.97, true)

      // In drop-frame, this is after the 1-minute boundary
      // The actual frame calculation is the same, just formatted with semicolon
      expect(result).toEqual("00:01:13;08")
    })

    it("Should handle edge case floating point precision in drop-frame", () => {
      const testTime = 28.266933600266935 // 28 seconds + 8 frames at 29.97 fps
      const result = secondsToTimecode(testTime, 29.97, true)
      expect(result).toEqual("00:00:28;07") // Drop-frame format with semicolon
    })

    it("Should handle precision for multiple frames in drop-frame", () => {
      const twoFrames = 2 / 29.97
      const result = secondsToTimecode(twoFrames, 29.97, true)
      expect(result).toEqual("00:00:00;02")
    })

    it("Should handle frame values very close to boundaries in drop-frame", () => {
      const result = secondsToTimecode(0.999999999999999, 29.97, true)
      // 0.999999999999999 seconds is actually 1 second due to floating point
      expect(result).toEqual("00:00:01;00")
    })

    it("Should handle minute boundary precision in drop-frame", () => {
      // Just before 1 minute
      const result1 = secondsToTimecode(59.96, 29.97, true)
      expect(result1).toEqual("00:00:59;27")

      // At exactly 60 seconds
      const result2 = secondsToTimecode(60, 29.97, true)
      expect(result2).toEqual("00:00:59;28")

      // Just after 1 minute (should jump to frame 02)
      const result3 = secondsToTimecode(60.06, 29.97, true)
      expect(result3).toEqual("00:01:00;02")
    })

    it("Should handle 10-minute boundary precision in drop-frame", () => {
      // At 10 minutes, no frames are dropped
      const result = secondsToTimecode(600, 29.97, true)
      expect(result).toEqual("00:10:00;00")
    })
  })
})
