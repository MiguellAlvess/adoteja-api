import { Adoption } from "../../../domain/adoption/entity/adoption.js"
import { PetRepository } from "../../ports/repository/pet-repository.js"
import { AdoptionRepository } from "../../ports/repository/adoption-repository.js"
import {
  AdoptionAlreadyRequestedError,
  PetNotAvailableForAdoptionError,
  PetNotFoundForAdoptionError,
} from "../../errors/adoption/index.js"

export class RequestAdoption {
  constructor(
    private readonly petRepository: PetRepository,
    private readonly adoptionRepository: AdoptionRepository
  ) {}

  async execute(input: Input): Promise<Output> {
    const pet = await this.petRepository.findById(input.petId)
    if (!pet) throw new PetNotFoundForAdoptionError()
    if (pet.getStatus() !== "AVAILABLE")
      throw new PetNotAvailableForAdoptionError()
    const existing = await this.adoptionRepository.findActiveByAdopterAndPet(
      input.adopterId,
      input.petId
    )
    if (existing) throw new AdoptionAlreadyRequestedError()
    const adoption = Adoption.request(input.petId, input.adopterId)
    await this.adoptionRepository.add(adoption)
    return {
      adoptionId: adoption.getId(),
      petId: adoption.getPetId(),
      adopterId: adoption.getAdopterId(),
      status: "PENDING",
      requestedAt: adoption.getRequestedAt(),
    }
  }
}

type Input = {
  petId: string
  adopterId: string
}

type Output = {
  adoptionId: string
  petId: string
  adopterId: string
  status: "PENDING"
  requestedAt: Date
}

export type { Input as RequestAdoptionInput, Output as RequestAdoptionOutput }
