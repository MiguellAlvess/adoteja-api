import { AdoptionRepository } from "../../ports/repository/adoption-repository.js"

export class GetAdoptionsByAdopter {
  constructor(private readonly adoptionRepository: AdoptionRepository) {}

  async execute(adopterId: string): Promise<Output> {
    const adoptions = await this.adoptionRepository.findByAdopterId(adopterId)
    return adoptions.map((adoption) => ({
      id: adoption.getId(),
      petId: adoption.getPetId(),
      adopterId: adoption.getAdopterId(),
      status: adoption.getStatusName(),
      requestedAt: adoption.getRequestedAt(),
      completedAt: adoption.getCompletedAt(),
    }))
  }
}

type Output = Array<{
  id: string
  petId: string
  adopterId: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED"
  requestedAt: Date
  completedAt: Date | null
}>
