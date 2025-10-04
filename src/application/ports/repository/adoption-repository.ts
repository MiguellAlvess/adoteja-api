import { Adoption } from "../../../domain/adoption/entity/adoption.js"

export interface AdoptionRepository {
  add(adoption: Adoption): Promise<void>
  findActiveByAdopterAndPet(
    adopterId: string,
    petId: string
  ): Promise<Adoption | null>
  findById(adoptionId: string): Promise<Adoption | null>
  findByPetId(petId: string): Promise<Adoption[]>
  update(adoption: Adoption): Promise<void>
}
