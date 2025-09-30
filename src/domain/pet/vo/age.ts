import { InvalidAgeError } from "../../errors/pet/pet-errors.js"

export default class Age {
  private value: number

  constructor(age: number) {
    if (!this.validateAge(age)) throw new InvalidAgeError()
    this.value = age
  }

  validateAge(age: number): boolean {
    return Number.isInteger(age) && age >= 0 && age <= 40
  }

  getValue(): number {
    return this.value
  }
}
