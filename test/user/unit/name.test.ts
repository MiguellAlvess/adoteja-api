import Name from "../../../src/domain/user/vo/name.js"

describe("Name", () => {
  test("should create a valid name", () => {
    const name = new Name("Robert Martin")
    expect(name).toBeDefined()
  })

  test("should reject invalid name", () => {
    expect(() => new Name("Test#321")).toThrow(new Error("Invalid name"))
  })
})
