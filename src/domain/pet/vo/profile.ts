import PetName from "./name.js"
import Species from "./species.js"
import Gender from "./gender.js"
import Age from "./age.js"
import Size from "./size.js"

export class PetProfile {
  constructor(
    private readonly name: PetName,
    private readonly species: Species,
    private readonly gender: Gender,
    private readonly age: Age,
    private readonly size: Size
  ) {}

  static create(
    name: string,
    species: string,
    gender: string,
    age: number,
    size: string
  ) {
    return new PetProfile(
      new PetName(name),
      new Species(species),
      new Gender(gender),
      new Age(age),
      new Size(size)
    )
  }

  getName() {
    return this.name.getValue()
  }
  getSpecies() {
    return this.species.getValue()
  }
  getGender() {
    return this.gender.getValue()
  }
  getAge() {
    return this.age.getValue()
  }
  getSize() {
    return this.size.getValue()
  }
}

export default PetProfile
