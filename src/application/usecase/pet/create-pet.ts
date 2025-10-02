import Pet from "../../../domain/pet/entity/pet.js"
import { Cache } from "../../ports/cache/cache.js"
import { PetRepository } from "../../ports/repository/pet-repository.js"
import { PhotoInput, PhotoStorage } from "../../ports/storage/photo-storage.js"

export class CreatePet {
  private readonly allPetsKey = "pets:all"

  constructor(
    private readonly petRepository: PetRepository,
    private readonly photoStorage: PhotoStorage,
    private readonly cache: Cache
  ) {}

  async execute(input: Input): Promise<Output> {
    let photoUrl: string | null = null
    if (input.photo) {
      photoUrl = await this.photoStorage.upload(input.photo)
    }
    const pet = Pet.create(
      input.ownerId,
      input.name,
      input.species,
      input.gender,
      input.age,
      input.size,
      input.description ?? null,
      photoUrl
    )
    await this.petRepository.add(pet)
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
  ownerId: string
  name: string
  species: string
  gender: string
  age: number
  size: string
  description?: string | null
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
