import { describe, it, expect, vi } from "vitest"
import { timecodeToSeconds, secondsToTimecode } from "./index"

describe("Drop-frame usage warnings", () => {
  describe("timecodeToSeconds warnings", () => {
    it("Should warn when using drop-frame format with non-drop-frame rates", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      // Test with 25 fps (PAL)
      timecodeToSeconds("01:00:00;00", 25)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Drop-frame timecode format (01:00:00;00) used with non-drop-frame rate 25 fps"),
      )

      // Test with 24 fps (film)
      consoleSpy.mockClear()
      timecodeToSeconds("00:30:00;00", 24)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Drop-frame timecode format (00:30:00;00) used with non-drop-frame rate 24 fps"),
      )

      // Test with 30 fps (digital)
      consoleSpy.mockClear()
      timecodeToSeconds("00:10:00;15", 30)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Drop-frame timecode format (00:10:00;15) used with non-drop-frame rate 30 fps"),
      )

      consoleSpy.mockRestore()
    })

    it("Should NOT warn when using drop-frame format with drop-frame rates", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      // Test with 29.97 fps
      timecodeToSeconds("01:00:00;00", 29.97)
      expect(consoleSpy).not.toHaveBeenCalled()

      // Test with 59.94 fps
      timecodeToSeconds("00:30:00;00", 59.94)
      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it("Should NOT warn when using non-drop format", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      // Test various frame rates with colon format
      timecodeToSeconds("01:00:00:00", 25)
      timecodeToSeconds("01:00:00:00", 29.97)
      timecodeToSeconds("01:00:00:00", 30)

      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe("secondsToTimecode warnings", () => {
    it("Should warn when converting long durations at 29.97 fps without drop-frame", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      // Test 1 hour (should warn)
      secondsToTimecode(3600, 29.97, false)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Converting 3600 seconds at 29.97 fps without drop-frame"),
      )
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("drift is approximately 4 seconds"))

      // Test 2 hours
      consoleSpy.mockClear()
      secondsToTimecode(7200, 29.97, false)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("After 2 hour(s), drift is approximately 7 seconds"),
      )

      consoleSpy.mockRestore()
    })

    it("Should warn when converting long durations at 59.94 fps without drop-frame", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      secondsToTimecode(3600, 59.94, false)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Converting 3600 seconds at 59.94 fps without drop-frame"),
      )

      consoleSpy.mockRestore()
    })

    it("Should NOT warn for short durations", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      // Under 1 hour should not warn
      secondsToTimecode(3599, 29.97, false)
      secondsToTimecode(1800, 29.97, false)
      secondsToTimecode(600, 29.97, false)

      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it("Should NOT warn when using drop-frame", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      // With drop-frame enabled, no warning
      secondsToTimecode(3600, 29.97, true)
      secondsToTimecode(7200, 29.97, true)

      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it("Should NOT warn for non-drop-frame rates", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      // Other frame rates don't need warnings
      secondsToTimecode(3600, 25, false)
      secondsToTimecode(3600, 24, false)
      secondsToTimecode(3600, 30, false)

      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it("Should NOT warn when dropFrame parameter is omitted (auto-detects)", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      // When dropFrame is not specified, it auto-detects based on duration
      // For long durations, it uses drop-frame automatically, so no warning
      secondsToTimecode(3600, 29.97)
      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})
