import { InvalidSizeError } from "../../errors/pet/pet-errors.js"

export type SizeType = "SMALL" | "MEDIUM" | "LARGE"

export default class Size {
  private value: SizeType

  constructor(size: string) {
    const normalized = size?.toString().trim().toUpperCase()
    if (!this.validateSize(normalized)) throw new InvalidSizeError()
    this.value = normalized as SizeType
  }

  validateSize(size: string): boolean {
    return size === "SMALL" || size === "MEDIUM" || size === "LARGE"
  }

  getValue(): SizeType {
    return this.value
  }
}
