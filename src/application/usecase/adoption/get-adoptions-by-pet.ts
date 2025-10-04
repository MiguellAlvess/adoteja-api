import { AdoptionRepository } from "../../ports/repository/adoption-repository.js"

export class GetAdoptionsByPet {
  constructor(private readonly adoptionRepository: AdoptionRepository) {}

  async execute(petId: string): Promise<Output[]> {
    const adoptions = await this.adoptionRepository.findByPetId(petId)
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

type Output = {
  id: string
  petId: string
  adopterId: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED"
  requestedAt: Date
  completedAt: Date | null
}
