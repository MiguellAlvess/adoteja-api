import DatabaseConnection from "../../database/database-connection.js"
import { AdoptionRepository } from "../../../application/ports/repository/adoption-repository.js"
import { Adoption } from "../../../domain/adoption/entity/adoption.js"
import { AdoptionStatus as PrismaAdoptionStatus } from "@prisma/client"

export class AdoptionRepositoryDatabase implements AdoptionRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async add(adoption: Adoption): Promise<void> {
    await this.db.query((prisma) =>
      prisma.adoption.create({
        data: {
          id: adoption.getId(),
          petId: adoption.getPetId(),
          adopterId: adoption.getAdopterId(),
          status: PrismaAdoptionStatus.PENDING,
          requestedAt: adoption.getRequestedAt(),
          completedAt: adoption.getCompletedAt(),
        },
      })
    )
  }

  async findActiveByAdopterAndPet(
    adopterId: string,
    petId: string
  ): Promise<Adoption | null> {
    const adoptionRow = await this.db.query((prisma) =>
      prisma.adoption.findFirst({
        where: {
          adopterId,
          petId,
          status: {
            in: [PrismaAdoptionStatus.PENDING, PrismaAdoptionStatus.APPROVED],
          },
        },
        select: {
          id: true,
          petId: true,
          adopterId: true,
          status: true,
          requestedAt: true,
          completedAt: true,
        },
      })
    )
    if (!adoptionRow) return null
    const status = adoptionRow.status as "PENDING" | "APPROVED"
    return Adoption.fromPersistence({
      id: adoptionRow.id,
      petId: adoptionRow.petId,
      adopterId: adoptionRow.adopterId,
      status,
      requestedAt: adoptionRow.requestedAt,
      completedAt: adoptionRow.completedAt,
    })
  }
}
