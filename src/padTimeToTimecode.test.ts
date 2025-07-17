import { describe, it, expect } from "vitest"
import padTimeToTimecode from "./padTimeToTimecode"

describe("padTimeToTimecode", () => {
  it("Should return already formatted timecode unchanged", () => {
    const result = padTimeToTimecode("01:02:03:04")
    expect(result).toEqual("01:02:03:04")
  })

  it("Should pad mm:ss format", () => {
    const result = padTimeToTimecode("10:30")
    expect(result).toEqual("00:10:30:00")
  })

  it("Should pad m:ss format", () => {
    const result = padTimeToTimecode("9:30")
    expect(result).toEqual("00:09:30:00")
  })

  it("Should pad hh:mm:ss format", () => {
    const result = padTimeToTimecode("01:10:30")
    expect(result).toEqual("01:10:30:00")
  })

  it("Should pad m.ss format", () => {
    const result = padTimeToTimecode("9.30")
    expect(result).toEqual("00:09:30:00")
  })

  it("Should pad mm.ss format", () => {
    const result = padTimeToTimecode("10.30")
    expect(result).toEqual("00:10:30:00")
  })

  it("Should pad single digit seconds", () => {
    const result = padTimeToTimecode("5")
    expect(result).toEqual("00:00:05:00")
  })

  it("Should pad double digit seconds", () => {
    const result = padTimeToTimecode("45")
    expect(result).toEqual("00:00:45:00")
  })

  it("Should return number unchanged", () => {
    const result = padTimeToTimecode(123)
    expect(result).toEqual(123)
  })
})
