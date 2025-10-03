import { PetRepository } from "../../ports/repository/pet-repository.js"
import { Cache } from "../../ports/cache/cache.js"
import { PhotoInput, PhotoStorage } from "../../ports/storage/photo-storage.js"
import { PetStatus } from "../../../domain/pet/pet-status.js"
import { NotPetOwnerError, PetNotFoundError } from "../../errors/pet/index.js"

export class UpdatePet {
  private readonly allPetsKey = "pets:all"

  constructor(
    private readonly petRepository: PetRepository,
    private readonly cache: Cache,
    private readonly photoStorage: PhotoStorage
  ) {}

  async execute(input: Input): Promise<Output> {
    const pet = await this.petRepository.findById(input.petId)
    if (!pet) throw new PetNotFoundError()
    if (!pet.isOwnedBy(input.requesterId)) throw new NotPetOwnerError()
    let newPhotoUrl: string | undefined
    if (input.photo) {
      newPhotoUrl = await this.photoStorage.upload(input.photo)
    }
    pet.update({
      name: input.name,
      species: input.species,
      gender: input.gender,
      age: input.age,
      size: input.size,
      description: input.description ?? undefined,
      photoUrl: newPhotoUrl ?? undefined,
      status: input.status as PetStatus | undefined,
    })
    await this.petRepository.update(pet)
    await this.cache.del(this.allPetsKey)
    return {
      petId: pet.getId(),
      ownerId: pet.getOwnerId(),
      name: pet.getName(),
      species: pet.getSpecies(),
      gender: pet.getGender(),
      age: pet.getAge(),
      size: pet.getSize(),
      description: pet.getDescription(),
      photoUrl: pet.getPhotoUrl(),
      status: pet.getStatus(),
    }
  }
}

export type Input = {
  petId: string
  requesterId: string
  name?: string
  species?: string
  gender?: string
  age?: number
  size?: string
  description?: string | null
  status?: string
  photo?: PhotoInput | null
}

export type Output = {
  petId: string
  ownerId: string
  name: string
  species: string
  gender: string
  age: number
  size: string
  description: string | null
  photoUrl: string | null
  status: string
}
