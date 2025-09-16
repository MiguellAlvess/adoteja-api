import { InvalidPasswordError } from "../../errors/account/account-errors.js"

export class Password {
  private value: string

  constructor(password: string) {
    if (!this.validatePassword(password)) throw new InvalidPasswordError()
    this.value = password
  }

  validatePassword(password: string) {
    return password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
  }

  getValue() {
    return this.value
  }
}
