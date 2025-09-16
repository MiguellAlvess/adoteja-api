import Email from "../../../src/domain/account/vo/email.js"
import { InvalidEmailError } from "../../../src/domain/errors/account/account-errors.js"

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
    expect(() => new Email(email)).toThrow(InvalidEmailError)
  })
  test("should accept a valid email", () => {
    const email = new Email("user@example.com")
    expect(email.getValue()).toBe("user@example.com")
  })
})
