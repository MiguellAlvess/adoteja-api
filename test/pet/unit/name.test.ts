import { InvalidPetNameError } from "../../../src/domain/errors/pet/pet-errors.js"
import PetName from "../../../src/domain/pet/vo/name.js"

describe("Pet Name", () => {
  test("should create a valid pet name", () => {
    const name = new PetName("Spike")
    expect(name).toBeDefined()
    expect(name.getValue()).toBe("Spike")
  })

  test.each(["", " ", "a", "a".repeat(61), "Bad#Name", "--", " . "])(
    "should reject invalid pet name '%s'",
    (name) => {
      expect(() => new PetName(name)).toThrow(InvalidPetNameError)
    }
  )
})
