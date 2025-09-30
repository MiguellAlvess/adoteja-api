import { InvalidSpeciesError } from "../../errors/pet/pet-errors.js"

export default class Species {
  private value: string

  constructor(species: string) {
    if (!this.validateSpecies(species)) throw new InvalidSpeciesError()
    this.value = species.trim()
  }

  validateSpecies(species: string): boolean {
    const s = species?.trim()
    if (!s) return false
    return s.length >= 2 && s.length <= 40
  }

  getValue(): string {
    return this.value
  }
}
