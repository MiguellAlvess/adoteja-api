import { InvalidSizeError } from "../../../src/domain/errors/pet/pet-errors.js"
import Size from "../../../src/domain/pet/vo/size.js"

describe("Size", () => {
  test.each(["SMALL", "MEDIUM", "LARGE", "small", "medium", "large"])(
    "should accept valid size '%s'",
    (s) => {
      const size = new Size(s as string)
      expect(["SMALL", "MEDIUM", "LARGE"]).toContain(size.getValue())
    }
  )

  test.each(["", " ", "GIANT", "mini", "Huge"])(
    "should reject invalid size '%s'",
    (size) => {
      expect(() => new Size(size as string)).toThrow(InvalidSizeError)
    }
  )
})
