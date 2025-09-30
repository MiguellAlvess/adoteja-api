import { InvalidAgeError } from "../../../src/domain/errors/pet/pet-errors.js"
import Age from "../../../src/domain/pet/vo/age.js"

describe("Age", () => {
  test.each([0, 1, 5, 12, 20, 30])("should accept valid age %s", (a) => {
    const age = new Age(a as number)
    expect(age.getValue()).toBe(a)
  })

  test.each([-1, -10, 31, 100, 2.5])("should reject invalid age %s", (age) => {
    expect(() => new Age(age)).toThrow(InvalidAgeError)
  })
})
