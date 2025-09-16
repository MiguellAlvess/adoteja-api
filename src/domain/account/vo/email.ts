import { InvalidEmailError } from "../../errors/account/account-errors.js"

export default class Email {
  private value: string

  constructor(email: string) {
    if (!this.validateEmail(email)) throw new InvalidEmailError()
    this.value = email
  }

  validateEmail(email: string) {
    return /^[^\s@]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/.test(email)
  }

  getValue() {
    return this.value
  }
}
