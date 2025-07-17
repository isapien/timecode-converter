import { describe, it, expect } from "vitest"
import secondsToTimecode from "./secondsToTimecode"

describe("secondsToTimecode", () => {
  it("Should convert 0 seconds to 00:00:00:00", () => {
    const result = secondsToTimecode(0)
    expect(result).toEqual("00:00:00:00")
  })

  it("Should convert with default 25 fps", () => {
    const result = secondsToTimecode(10)
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
    const result = secondsToTimecode(3661)
    expect(result).toEqual("01:01:01:00")
  })

  it("Should normalize player time correctly", () => {
    // Testing edge cases for frame boundaries
    const result = secondsToTimecode(0.04, 25)
    expect(result).toEqual("00:00:00:01")
  })
})
