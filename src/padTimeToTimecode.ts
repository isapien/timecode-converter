import type { TimecodeFormat } from "./types"

const countColon = (timecode: string): number => timecode.split(":").length

const includesFullStop = (timecode: string): boolean => timecode.includes(".")

const isOneDigit = (str: string): boolean => str.length === 1

/**
 * Pads various time formats to standard timecode format
 * @param time - Time in various formats (hh:mm:ss:ff, mm:ss, m:ss, m.ss, s)
 * @returns Standard timecode format hh:mm:ss:ff
 */
const padTimeToTimecode = (time: string | number): TimecodeFormat | number => {
  if (typeof time === "string") {
    switch (countColon(time)) {
      case 4:
        // is already in timecode format
        // hh:mm:ss:ff
        return time
      case 2: {
        // m:ss or mm:ss
        const parts = time.split(":")
        if (isOneDigit(parts[0]!)) {
          return `00:0${time}:00`
        }
        return `00:${time}:00`
      }
      case 3:
        // hh:mm:ss
        return `${time}:00`
      default: {
        // mm.ss or m.ss
        if (includesFullStop(time)) {
          const parts = time.split(".")
          // m.ss
          if (isOneDigit(parts[0]!)) {
            return `00:0${parts[0]}:${parts[1]}:00`
          }
          return `00:${time.replace(".", ":")}:00`
        }

        // if just int, then it's seconds
        // s or ss
        if (isOneDigit(time)) {
          return `00:00:0${time}:00`
        }
        return `00:00:${time}:00`
      }
    }
  }
  // edge case if it's number return a number coz cannot refactor
  // TODO: might need to refactor and move this elsewhere
  return time
}

export default padTimeToTimecode
