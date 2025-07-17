import { describe, it, expect } from "vitest"
import timecodeToSecondsHelper from "./timecodeToSeconds"

describe("timecodeToSecondsHelper", () => {
  it("Should convert basic timecode with default fps", () => {
    const result = timecodeToSecondsHelper("00:00:10:00")
    expect(result).toEqual(10)
  })

  it("Should convert with custom frame rate", () => {
    const result = timecodeToSecondsHelper("00:00:01:00", 30)
    expect(result).toEqual(1)
  })

  it("Should handle frames correctly", () => {
    const result = timecodeToSecondsHelper("00:00:00:25", 25)
    expect(result).toEqual(1)
  })

  it("Should handle complex timecode", () => {
    const result = timecodeToSecondsHelper("01:30:45:12", 25)
    // 1 hour = 3600 seconds
    // 30 minutes = 1800 seconds
    // 45 seconds = 45 seconds
    // 12 frames at 25fps = 0.48 seconds
    expect(result).toEqual(5445.48)
  })

  it("Should round to 2 decimal places", () => {
    const result = timecodeToSecondsHelper("00:00:00:01", 30)
    expect(result).toEqual(0.03)
  })
})
