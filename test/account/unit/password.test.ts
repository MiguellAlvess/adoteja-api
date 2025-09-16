import { Password } from "../../../src/domain/account/vo/password.js"
import { InvalidPasswordError } from "../../../src/domain/errors/account/account-errors.js"

describe("Password", () => {
  test.each(["", "short", "nouppercase1", "NOLOWERCASE1", "NoNumber"])(
    'should reject invalid "%s"',
    (password) => {
      expect(() => new Password(password)).toThrow(InvalidPasswordError)
    }
  )
  test("should accept a valid password", () => {
    const password = new Password("Validpassowrd123")
    expect(password.getValue()).toBe("Validpassowrd123")
  })
})
