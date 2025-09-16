import { InvalidPasswordHashError } from "../../errors/account/account-errors.js"

export class PasswordHash {
  private value: string
  constructor(hash: string) {
    if (!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash)) {
      throw new InvalidPasswordHashError()
    }
    this.value = hash
  }

  getValue() {
    return this.value
  }
}
