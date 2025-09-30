import { InvalidGenderError } from "../../../src/domain/errors/pet/pet-errors.js"
import Gender from "../../../src/domain/pet/vo/gender.js"

describe("Gender", () => {
  test.each(["MALE", "FEMALE", "UNKNOWN", "male", "female", "unknown"])(
    "should accept valid gender '%s'",
    (g) => {
      const gender = new Gender(g as string)
      expect(["MALE", "FEMALE", "UNKNOWN"]).toContain(gender.getValue())
    }
  )

  test.each(["", " ", "other", "boy", "girl", "malee"])(
    "should reject invalid gender '%s'",
    (gender) => {
      expect(() => new Gender(gender as string)).toThrow(InvalidGenderError)
    }
  )
})
