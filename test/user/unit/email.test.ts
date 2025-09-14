import Email from "../../../src/domain/user/vo/email.js"

describe("Email", () => {
  test.each([
    "",
    "   ",
    "invalid-email",
    "abc@",
    "@xyz.com",
    "abc@xyz",
    "user@exa mple.com",
    "user@.com",
    "user@com",
  ])('should reject invalid "%s"', (email) => {
    expect(() => new Email(email)).toThrow("Invalid email")
  })
  test("should accept a valid email", () => {
    const email = new Email("user@example.com")
    expect(email.getValue()).toBe("user@example.com")
  })
})
