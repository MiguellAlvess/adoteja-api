import { PetRepository } from "../../ports/repository/pet-repository.js"
import { Cache } from "../../ports/cache/cache.js"
import { NotPetOwnerError, PetNotFoundError } from "../../errors/pet/index.js"

export class DeletePet {
  private readonly allPetsKey = "pets:all"

  constructor(
    private readonly petRepository: PetRepository,
    private readonly cache: Cache
  ) {}
  async execute(petId: string, requesterId: string): Promise<void> {
    const pet = await this.petRepository.findById(petId)
    if (!pet) throw new PetNotFoundError()
    if (!pet.isOwnedBy(requesterId)) {
      throw new NotPetOwnerError()
    }
    await this.petRepository.delete(petId)
    await this.cache.del(this.allPetsKey)
  }
}
