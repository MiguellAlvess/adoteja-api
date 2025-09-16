import { InvalidPhoneNumberError } from "../../errors/account/account-errors.js"

export class PhoneNumber {
  private value: string

  constructor(phoneNumber: string) {
    if (!this.validatePhoneNumber(phoneNumber))
      throw new InvalidPhoneNumberError()
    this.value = phoneNumber
  }

  validatePhoneNumber(phoneNumber: string) {
    return /^(?:\+?55\s*)?\(?[1-9]\d\)?\s*9\d{4}-?\d{4}$/.test(phoneNumber)
  }

  getValue() {
    return this.value
  }
}
