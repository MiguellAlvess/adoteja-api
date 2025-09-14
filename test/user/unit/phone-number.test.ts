import { PhoneNumber } from "../../../src/domain/user/vo/phone-number.js"

describe("Phone Number", () => {
  test.each([
    "",
    "   ",
    "phonenumber",
    "222",
    "123456",
    "(11) 9 9999-99922229",
    "(00) 996049805",
    "(83) 86049805",
    "(83) 99604980",
    "(83) 9960498055",
    "83 9960-49805",
    "user@exa mple.com",
    " (83) 99604-9805x",
  ])("should reject invalid %s", (phoneNumber) => {
    expect(() => new PhoneNumber(phoneNumber)).toThrow("Invalid phone number")
  })
  test.each([
    "(83) 996049805",
    "(83) 99604-9805",
    "83 99604-9805",
    "+55 (83) 996049805",
    "+5583996049805",
  ])("should accept valid %s", (phone) => {
    const phoneNumber = new PhoneNumber(phone)
    expect(phoneNumber).toBeInstanceOf(PhoneNumber)
  })
})
