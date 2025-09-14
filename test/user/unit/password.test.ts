import { Password } from "../../../src/domain/user/vo/password.js"

describe("Password", () => {
  test.each(["", "short", "nouppercase1", "NOLOWERCASE1", "NoNumber"])(
    'should reject invalid "%s"',
    (password) => {
      expect(() => new Password(password)).toThrow("Invalid password")
    }
  )
  test("should accept a valid password", () => {
    const password = new Password("Validpassowrd123")
    expect(password.getValue()).toBe("Validpassowrd123")
  })
})
