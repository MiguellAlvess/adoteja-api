export default class Email {
  private value: string

  constructor(email: string) {
    if (!this.validateEmail(email)) throw new Error("Invalid email")
    this.value = email
  }

  validateEmail(email: string) {
    return /^[^\s@]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/.test(email)
  }

  getValue() {
    return this.value
  }
}
