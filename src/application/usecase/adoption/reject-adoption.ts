import { AdoptionRepository } from "../../ports/repository/adoption-repository.js"
import { AdoptionNotFoundError } from "../../errors/adoption/index.js"

export class RejectAdoption {
  constructor(private readonly adoptionRepository: AdoptionRepository) {}

  async execute(adoptionId: string): Promise<Output> {
    const adoption = await this.adoptionRepository.findById(adoptionId)
    if (!adoption) {
      throw new AdoptionNotFoundError()
    }
    adoption.reject()
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
