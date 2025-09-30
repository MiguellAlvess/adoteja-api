import { InvalidDescriptionError } from "../../errors/pet/pet-errors.js"

export default class Description {
  private value: string | null

  constructor(description?: string | null) {
    if (!this.validateDescription(description))
      throw new InvalidDescriptionError()
    const desc = description?.trim()
    this.value = desc ? desc : null
  }

  validateDescription(description?: string | null): boolean {
    if (description == null || description === "") return true
    const desc = description.trim()
    return desc.length <= 500
  }

  getValue(): string | null {
    return this.value
  }
}
