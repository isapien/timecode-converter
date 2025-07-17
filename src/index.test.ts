import { describe, it, expect } from "vitest"
import { timecodeToSeconds, secondsToTimecode, shortTimecode } from "./index"

describe("Timecode conversion TC- convertToSeconds", () => {
  it("Should be defined", () => {
    const demoTcValue = "00:10:00:00"
    const result = timecodeToSeconds(demoTcValue)
    expect(result).toBeDefined()
  })

  it("Should be able to convert: hh:mm:ss:ff", () => {
    const demoTcValue = "00:10:00:00"
    const demoExpectedResultInSeconds = 600
    const result = timecodeToSeconds(demoTcValue)
    expect(result).toEqual(demoExpectedResultInSeconds)
  })

  it("Should be able to convert: mm:ss", () => {
    const demoTcValue = "10:00"
    const demoExpectedResultInSeconds = 600
    const result = timecodeToSeconds(demoTcValue)
    expect(result).toEqual(demoExpectedResultInSeconds)
  })

  it("Should be able to convert: m:ss", () => {
    const demoTcValue = "09:00"
    const demoExpectedResultInSeconds = 540
    const result = timecodeToSeconds(demoTcValue)
    expect(result).toEqual(demoExpectedResultInSeconds)
  })

  it("Should be able to convert: m.ss", () => {
    const demoTcValue = "9.01"
    const demoExpectedResultInSeconds = 541
    const result = timecodeToSeconds(demoTcValue)
    expect(result).toEqual(demoExpectedResultInSeconds)
  })

  it("Should be able to convert: ss - seconds", () => {
    const demoTcValue = 600
    const demoExpectedResultInSeconds = 600
    const result = timecodeToSeconds(demoTcValue)
    expect(result).toEqual(demoExpectedResultInSeconds)
  })

  it.skip("Should be able to convert: ss - seconds - even if it is string", () => {
    const demoTcValue = "600"
    const demoExpectedResultInSeconds = 600
    const result = timecodeToSeconds(demoTcValue)
    expect(result).toEqual(demoExpectedResultInSeconds)
  })

  it("Should be able to convert: hh:mm:ss", () => {
    const demoTcValue = "00:10:00"
    const demoExpectedResultInSeconds = 600
    const result = timecodeToSeconds(demoTcValue)
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
})

describe("Timecode conversion seconds to - convertToTimecode", () => {
  it("Should be able to convert seconds to timecode hh:mm:ss:ff", () => {
    const demoSeconds = 600
    const demoExpectedResultInTc = "00:10:00:00"
    const result = secondsToTimecode(demoSeconds)
    expect(result).toEqual(demoExpectedResultInTc)
  })

  it("Should be able to convert seconds - string to timecode hh:mm:ss:ff", () => {
    const demoSeconds = 600
    const demoExpectedResultInTc = "00:10:00:00"
    const result = secondsToTimecode(demoSeconds)
    expect(result).toEqual(demoExpectedResultInTc)
  })
})

describe("shortTimecode", () => {
  it("Should convert 0 to 00:00:00", () => {
    const result = shortTimecode(0)
    expect(result).toEqual("00:00:00")
  })

  it("Should convert timecode to short format", () => {
    const result = shortTimecode("00:10:00:00")
    expect(result).toEqual("00:10:00")
  })

  it("Should convert seconds to short format", () => {
    const result = shortTimecode(600)
    expect(result).toEqual("00:10:00")
  })
})
