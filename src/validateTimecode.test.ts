import { describe, it, expect } from "vitest"
import { validateTimecode } from "./validateTimecode"

describe("validateTimecode", () => {
  describe("Basic format validation", () => {
    it("Should validate correct non-drop frame timecode", () => {
      const result = validateTimecode("01:30:45:12", 25)
      expect(result.valid).toBe(true)
      expect(result.format).toBe("non-drop")
      expect(result.errors).toHaveLength(0)
      expect(result.components).toEqual({
        hours: 1,
        minutes: 30,
        seconds: 45,
        frames: 12,
      })
    })

    it("Should validate correct drop-frame timecode", () => {
      const result = validateTimecode("01:30:45;12", 29.97)
      expect(result.valid).toBe(true)
      expect(result.format).toBe("drop-frame")
      expect(result.errors).toHaveLength(0)
    })

    it("Should reject invalid format", () => {
      const result = validateTimecode("1:30:45", 25)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Invalid timecode format. Expected hh:mm:ss:ff or hh:mm:ss;ff, got 1:30:45")
    })
  })

  describe("Range validation", () => {
    it("Should reject hours > 23", () => {
      const result = validateTimecode("25:00:00:00", 25)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Hours cannot exceed 23")
    })

    it("Should reject minutes > 59", () => {
      const result = validateTimecode("00:60:00:00", 25)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Minutes cannot exceed 59")
    })

    it("Should reject seconds > 59", () => {
      const result = validateTimecode("00:00:60:00", 25)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Seconds cannot exceed 59")
    })

    it("Should reject frames exceeding frame rate", () => {
      const result = validateTimecode("00:00:00:25", 25)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Frames cannot exceed 24 for 25 fps")
    })

    it("Should accept maximum valid frame", () => {
      const result = validateTimecode("00:00:00:24", 25)
      expect(result.valid).toBe(true)
    })

    it("Should handle 29.97 fps frame limit", () => {
      const result = validateTimecode("00:00:00:30", 29.97)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Frames cannot exceed 29 for 29.97 fps")
    })
  })

  describe("Drop-frame specific validation", () => {
    it("Should warn about drop-frame format with non-drop-frame rate", () => {
      const result = validateTimecode("01:00:00;00", 25)
      expect(result.valid).toBe(true)
      expect(result.warnings).toContain(
        "Drop-frame format used with non-drop-frame rate 25 fps. Drop-frame is only valid for 29.97 and 59.94 fps.",
      )
    })

    it("Should reject invalid drop-frame timecodes at minute boundaries", () => {
      const result = validateTimecode("00:01:00;00", 29.97)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Invalid drop-frame timecode. Frames 00 and 01 don't exist at minute 1")

      const result2 = validateTimecode("00:02:00;01", 29.97)
      expect(result2.valid).toBe(false)
      expect(result2.errors).toContain("Invalid drop-frame timecode. Frames 00 and 01 don't exist at minute 2")
    })

    it("Should allow frames 00 and 01 at 10-minute boundaries", () => {
      const result = validateTimecode("00:10:00;00", 29.97)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)

      const result2 = validateTimecode("00:20:00;01", 29.97)
      expect(result2.valid).toBe(true)
      expect(result2.errors).toHaveLength(0)
    })

    it("Should allow frame 02 at minute boundaries", () => {
      const result = validateTimecode("00:01:00;02", 29.97)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("Should warn when drop-frame format is used without frame rate", () => {
      const result = validateTimecode("01:00:00;00")
      expect(result.valid).toBe(true)
      expect(result.warnings).toContain("Drop-frame format detected but no frame rate provided for validation")
    })
  })

  describe("Multiple errors", () => {
    it("Should report all errors", () => {
      const result = validateTimecode("25:60:60:30", 25)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(4)
      expect(result.errors).toContain("Hours cannot exceed 23")
      expect(result.errors).toContain("Minutes cannot exceed 59")
      expect(result.errors).toContain("Seconds cannot exceed 59")
      expect(result.errors).toContain("Frames cannot exceed 24 for 25 fps")
    })
  })

  describe("Without frame rate", () => {
    it("Should validate basic structure without frame rate", () => {
      const result = validateTimecode("01:30:45:12")
      expect(result.valid).toBe(true)
      expect(result.components).toEqual({
        hours: 1,
        minutes: 30,
        seconds: 45,
        frames: 12,
      })
    })

    it("Should not validate frame count without frame rate", () => {
      const result = validateTimecode("00:00:00:99")
      expect(result.valid).toBe(true) // Can't validate frame limit without knowing fps
      expect(result.errors).toHaveLength(0)
    })
  })
})
