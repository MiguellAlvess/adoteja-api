import { PetRepository } from "../../../application/ports/repository/pet-repository.js"
import Pet from "../../../domain/pet/entity/pet.js"
import DatabaseConnection from "../../database/database-connection.js"
import { PetStatus as PrismaPetStatus } from "@prisma/client"
import { PetStatus } from "../../../domain/pet/pet-status.js"

export class PetRepositoryDatabase implements PetRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async add(pet: Pet): Promise<void> {
    await this.db.query((prisma) =>
      prisma.pet.create({
        data: {
          id: pet.getId(),
          ownerId: pet.getOwnerId(),
          name: pet.getName(),
          species: pet.getSpecies(),
          gender: pet.getGender(),
          age: pet.getAge(),
          size: pet.getSize(),
          description: pet.getDescription(),
          photoUrl: pet.getPhotoUrl(),
          status: pet.getStatus() as unknown as PrismaPetStatus,
        },
      })
    )
  }

  async findById(petId: string): Promise<Pet | null> {
    const petRow = await this.db.query((prisma) =>
      prisma.pet.findUnique({
        where: { id: petId },
        select: {
          id: true,
          ownerId: true,
          name: true,
          species: true,
          gender: true,
          age: true,
          size: true,
          description: true,
          photoUrl: true,
          status: true,
        },
      })
    )
    if (!petRow) return null
    return new Pet(
      petRow.id,
      petRow.ownerId,
      petRow.name,
      petRow.species,
      petRow.gender,
      petRow.age,
      petRow.size,
      petRow.description ?? null,
      petRow.photoUrl ?? null,
      petRow.status as PetStatus
    )
  }

  async findAll(): Promise<Pet[]> {
    const petsRow = await this.db.query((prisma) =>
      prisma.pet.findMany().catch(async () => {
        return prisma.pet.findMany()
      })
    )
    return petsRow.map(
      (petRow) =>
        new Pet(
          petRow.id,
          petRow.ownerId,
          petRow.name,
          petRow.species,
          petRow.gender,
          petRow.age,
          petRow.size,
          petRow.description ?? null,
          petRow.photoUrl ?? null,
          petRow.status as PetStatus
        )
    )
  }

  async delete(petId: string): Promise<void> {
    await this.db.query((prisma) => prisma.pet.delete({ where: { id: petId } }))
  }
}
