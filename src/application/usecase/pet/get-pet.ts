import { PetNotFoundError } from "../../errors/pet/index.js"
import { PetRepository } from "../../ports/repository/pet-repository.js"

export class GetPet {
  constructor(private petRepository: PetRepository) {}

  async execute(petId: string): Promise<Output> {
    const pet = await this.petRepository.findById(petId)
    if (!pet) {
      throw new PetNotFoundError()
    }
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

type Output = {
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
