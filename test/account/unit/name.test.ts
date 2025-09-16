import Name from "../../../src/domain/account/vo/name.js"
import { InvalidNameError } from "../../../src/domain/errors/account/account-errors.js"

describe("Name", () => {
  test("should create a valid name", () => {
    const name = new Name("Robert Martin")
    expect(name).toBeDefined()
  })

  test("should reject invalid name", () => {
    expect(() => new Name("Test#321")).toThrow(InvalidNameError)
  })
})
