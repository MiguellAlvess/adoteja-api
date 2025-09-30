import { InvalidDescriptionError } from "../../../src/domain/errors/pet/pet-errors.js"
import Description from "../../../src/domain/pet/vo/description.js"

describe("Description", () => {
  test.each([
    undefined,
    null,
    "",
    "Adorable and friendly dog",
    "a".repeat(500),
  ])("should accept valid description: %s", (d) => {
    const description = new Description(d)
    expect(description.getValue()).toBe(d == null || d === "" ? null : d)
  })

  test("should reject description longer than 500 chars", () => {
    const longDescription = "a".repeat(501)
    expect(() => new Description(longDescription)).toThrow(
      InvalidDescriptionError
    )
  })
})
