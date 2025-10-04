import { AdoptionRepository } from "../../ports/repository/adoption-repository.js"
import { AdoptionNotFoundError } from "../../errors/adoption/index.js"

export class CompleteAdoption {
  constructor(private readonly adoptionRepository: AdoptionRepository) {}

  async execute(adoptionId: string): Promise<Output> {
    const adoption = await this.adoptionRepository.findById(adoptionId)
    if (!adoption) throw new AdoptionNotFoundError()
    adoption.complete()
    await this.adoptionRepository.update(adoption)
    return {
      id: adoption.getId(),
      petId: adoption.getPetId(),
      adopterId: adoption.getAdopterId(),
      status: adoption.getStatusName(),
      requestedAt: adoption.getRequestedAt(),
      completedAt: adoption.getCompletedAt(),
    }
  }
}

type Output = {
  id: string
  petId: string
  adopterId: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED"
  requestedAt: Date
  completedAt: Date | null
}
