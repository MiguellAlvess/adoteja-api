import Pet from "../../../domain/pet/entity/pet.js"

export interface PetRepository {
  add: (pet: Pet) => Promise<void>
  findById: (petId: string) => Promise<Pet | null>
}
