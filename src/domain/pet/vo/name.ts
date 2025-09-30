import { InvalidPetNameError } from "../../errors/pet/pet-errors.js"

export default class PetName {
  private value: string

  constructor(name: string) {
    if (!this.validateName(name)) throw new InvalidPetNameError()
    this.value = name.trim()
  }

  validateName(name: string): boolean {
    const n = name?.trim()
    if (!n) return false
    if (n.length < 2 || n.length > 60) return false
    return /^[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:[ '\-\][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*$/.test(n)
  }

  getValue(): string {
    return this.value
  }
}
