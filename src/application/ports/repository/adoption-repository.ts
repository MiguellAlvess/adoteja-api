import { Adoption } from "../../../domain/adoption/entity/adoption.js"

export interface AdoptionRepository {
  add(adoption: Adoption): Promise<void>
  findActiveByAdopterAndPet(
    adopterId: string,
    petId: string
  ): Promise<Adoption | null>
}
