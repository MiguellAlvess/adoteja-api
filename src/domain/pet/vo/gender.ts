import { InvalidGenderError } from "../../errors/pet/pet-errors.js"

export type GenderType = "MALE" | "FEMALE" | "UNKNOWN"

export default class Gender {
  private value: GenderType

  constructor(gender: string) {
    const normalized = gender?.toString().trim().toUpperCase()
    if (!this.validateGender(normalized)) throw new InvalidGenderError()
    this.value = normalized as GenderType
  }

  validateGender(gender: string): boolean {
    return gender === "MALE" || gender === "FEMALE" || gender === "UNKNOWN"
  }

  getValue(): GenderType {
    return this.value
  }
}
