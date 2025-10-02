import { Cache } from "../../ports/cache/cache.js"
import { PetRepository } from "../../ports/repository/pet-repository.js"

export class GetAllPets {
  private readonly cacheKey = "pets:all"

  constructor(
    private readonly petRepository: PetRepository,
    private readonly cache: Cache,
    private readonly ttlSeconds: number = 60
  ) {}

  async execute(): Promise<Output[]> {
    const cached = await this.cache.get<Output[]>(this.cacheKey)
    if (cached) return cached
    const pets = await this.petRepository.findAll()
    const output: Output[] = pets.map((pet) => ({
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
    }))
    await this.cache.set(this.cacheKey, output, this.ttlSeconds)
    return output
  }
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
