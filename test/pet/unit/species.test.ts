import { InvalidSpeciesError } from "../../../src/domain/errors/pet/pet-errors.js"
import Species from "../../../src/domain/pet/vo/species.js"

describe("Species", () => {
  test.each(["Dog", "Cat", "Golden Retriever", "SRD"])(
    "should accept valid species '%s'",
    (specie) => {
      const species = new Species(specie)
      expect(species.getValue()).toBe(specie.trim())
    }
  )

  test.each(["", " ", "a", "a".repeat(41)])(
    "should reject invalid species '%s'",
    (specie) => {
      expect(() => new Species(specie)).toThrow(InvalidSpeciesError)
    }
  )
})
