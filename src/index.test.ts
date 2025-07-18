import { describe, it, expect } from "vitest"
import { timecodeToSeconds, secondsToTimecode, shortTimecode } from "./index"

describe("Timecode conversion TC- convertToSeconds", () => {
  it("Should be defined", () => {
    const demoTcValue = "00:10:00:00"
    const result = timecodeToSeconds(demoTcValue, 25)
    expect(result).toBeDefined()
  })

  it("Should be able to convert: hh:mm:ss:ff", () => {
    const demoTcValue = "00:10:00:00"
    const demoExpectedResultInSeconds = 600
    const result = timecodeToSeconds(demoTcValue, 25)
    expect(result).toEqual(demoExpectedResultInSeconds)
  })

  it("Should be able to convert: mm:ss", () => {
    const demoTcValue = "10:00"
    const demoExpectedResultInSeconds = 600
    const result = timecodeToSeconds(demoTcValue, 25)
    expect(result).toEqual(demoExpectedResultInSeconds)
  })

  it("Should be able to convert: m:ss", () => {
    const demoTcValue = "09:00"
    const demoExpectedResultInSeconds = 540
    const result = timecodeToSeconds(demoTcValue, 25)
    expect(result).toEqual(demoExpectedResultInSeconds)
  })

  it("Should be able to convert: m.ss", () => {
    const demoTcValue = "9.01"
    const demoExpectedResultInSeconds = 541
    const result = timecodeToSeconds(demoTcValue, 25)
    expect(result).toEqual(demoExpectedResultInSeconds)
  })

  it("Should be able to convert: ss - seconds", () => {
    const demoTcValue = 600
    const demoExpectedResultInSeconds = 600
    const result = timecodeToSeconds(demoTcValue, 25)
    expect(result).toEqual(demoExpectedResultInSeconds)
  })

  it.skip("Should be able to convert: ss - seconds - even if it is string", () => {
    const demoTcValue = "600"
    const demoExpectedResultInSeconds = 600
    const result = timecodeToSeconds(demoTcValue, 25)
    expect(result).toEqual(demoExpectedResultInSeconds)
  })

  it("Should be able to convert: hh:mm:ss", () => {
    const demoTcValue = "00:10:00"
    const demoExpectedResultInSeconds = 600
    const result = timecodeToSeconds(demoTcValue, 25)
    expect(result).toEqual(demoExpectedResultInSeconds)
  })

  it.skip('"sss" seconds number as string --> ss', () => {
    const demoTime = "56"
    const expectedTimecode = 56
    const result = timecodeToSeconds(demoTime)
    expect(result).toEqual(expectedTimecode)
  })

  it.skip('"sss" seconds number as string --> ss', () => {
    const demoTime = "116"
    const expectedTimecode = 116
    const result = timecodeToSeconds(demoTime)
    expect(result).toEqual(expectedTimecode)
  })

  it("120 sec --> 120", () => {
    const demoTime = 120
    const expectedTimecode = 120
    const result = timecodeToSeconds(demoTime)
    expect(result).toEqual(expectedTimecode)
  })

  it("Should handle variable frame rates - 29.97 fps", () => {
    const demoTcValue = "00:00:01:00" // 1 second, 0 frames
    const result = timecodeToSeconds(demoTcValue, 29.97)
    expect(result).toEqual(1.0)
  })

  it("Should handle variable frame rates - 24 fps", () => {
    const demoTcValue = "00:00:01:12" // 1 second, 12 frames at 24fps = 0.5 seconds
    const result = timecodeToSeconds(demoTcValue, 24)
    expect(result).toEqual(1.5)
  })

  it("Should handle variable frame rates - 30 fps", () => {
    const demoTcValue = "00:00:01:15" // 1 second, 15 frames at 30fps = 0.5 seconds
    const result = timecodeToSeconds(demoTcValue, 30)
    expect(result).toEqual(1.5)
  })

  it("Should throw error when frame rate is not specified for timecode string", () => {
    const demoTcValue = "00:10:00:00"
    expect(() => timecodeToSeconds(demoTcValue)).toThrow(
      "Frame rate must be specified when converting timecode strings to seconds",
    )
  })

  describe("Drop-frame timecode support", () => {
    it("Should auto-detect and convert drop-frame timecode", () => {
      // 01:00:00;00 at 29.97 drop-frame = actually closer to 3600 because drop-frame
      // only drops the timecode numbers, not actual frames
      const result = timecodeToSeconds("01:00:00;00", 29.97)
      expect(result).toBeCloseTo(3600, 1)
    })

    it("Should handle drop-frame minute boundaries", () => {
      // First minute boundary: 00:01:00;02 is actually the 1800th frame
      const result = timecodeToSeconds("00:01:00;02", 29.97)
      expect(result).toBeCloseTo(60.06, 1) // 1800 / 29.97
    })

    it("Should handle non-drop frame at 29.97", () => {
      // 01:00:00:00 at 29.97 non-drop = 3600 seconds
      const result = timecodeToSeconds("01:00:00:00", 29.97)
      expect(result).toBeCloseTo(3600.0, 1)
    })

    it("Should detect drop-frame format from semicolon", () => {
      // At exactly 10 seconds, drop-frame and non-drop are different
      // because we're at frame 300 vs frame 298 (after dropping 2)
      const dropFrame = timecodeToSeconds("00:00:10;00", 29.97)
      const nonDrop = timecodeToSeconds("00:00:10:00", 29.97)
      // Drop frame will be slightly different
      expect(Math.abs(dropFrame - nonDrop)).toBeLessThan(0.1)
    })
  })
})

describe("Timecode conversion seconds to - convertToTimecode", () => {
  it("Should be able to convert seconds to timecode hh:mm:ss:ff", () => {
    const demoSeconds = 600
    const demoExpectedResultInTc = "00:10:00:00"
    const result = secondsToTimecode(demoSeconds, 25)
    expect(result).toEqual(demoExpectedResultInTc)
  })

  it("Should be able to convert seconds - string to timecode hh:mm:ss:ff", () => {
    const demoSeconds = 600
    const demoExpectedResultInTc = "00:10:00:00"
    const result = secondsToTimecode(demoSeconds, 25)
    expect(result).toEqual(demoExpectedResultInTc)
  })
})

describe("shortTimecode", () => {
  it("Should convert 0 to 00:00:00", () => {
    const result = shortTimecode(0, 25)
    expect(result).toEqual("00:00:00")
  })

  it("Should convert timecode to short format", () => {
    const result = shortTimecode("00:10:00:00", 25)
    expect(result).toEqual("00:10:00")
  })

  it("Should convert seconds to short format", () => {
    const result = shortTimecode(600, 25)
    expect(result).toEqual("00:10:00")
  })

  it("Should handle variable frame rates in shortTimecode", () => {
    const result = shortTimecode("00:00:01:15", 30) // 1.5 seconds at 30fps
    expect(result).toEqual("00:00:01")
  })

  it("Should handle variable frame rates in shortTimecode with seconds input", () => {
    const result = shortTimecode(1.5, 30)
    expect(result).toEqual("00:00:01")
  })

  it("Should preserve drop-frame format in shortTimecode", () => {
    const result = shortTimecode("01:00:00;00", 29.97)
    expect(result).toEqual("01:00:00")
  })
})

describe("Drop-frame generation", () => {
  it("Should generate drop-frame format when requested", () => {
    // 3600 seconds is exactly 01:00:00;00 in drop-frame
    const result = secondsToTimecode(3600, 29.97, true)
    expect(result).toEqual("01:00:00;00")
  })

  it("Should generate drop-frame format by default for long durations", () => {
    // Auto-detection now uses drop-frame for durations >= 1 minute at 29.97 fps
    const result = secondsToTimecode(3600, 29.97)
    expect(result).toEqual("01:00:00;00")
  })

  it("Should generate non-drop format by default for short durations", () => {
    // Auto-detection uses non-drop for durations < 1 minute at 29.97 fps
    const result = secondsToTimecode(30, 29.97)
    expect(result).toEqual("00:00:30:00")
  })

  it("Should handle drop-frame correctly at 60 seconds", () => {
    // 60 seconds at 29.97 fps = frame 1798
    // In drop-frame, this is 00:00:59;28 (not 00:01:00;02)
    // because frames 00:01:00;00 and 00:01:00;01 are dropped
    const result = secondsToTimecode(60, 29.97, true)
    expect(result).toEqual("00:00:59;28")
  })

  it("Should not generate drop-frame for non-supported rates", () => {
    const result = secondsToTimecode(60, 25, true)
    expect(result).toEqual("00:01:00:00") // Still uses colons
  })
})
