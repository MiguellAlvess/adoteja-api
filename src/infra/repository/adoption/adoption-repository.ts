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

  async update(adoption: Adoption): Promise<void> {
    await this.db.query((prisma) =>
      prisma.adoption.update({
        where: { id: adoption.getId() },
        data: {
          status: adoption.getStatusName(),
          completedAt: adoption.getCompletedAt(),
        },
      })
    )
  }

  async findById(adoptionId: string): Promise<Adoption | null> {
    const adoptionRow = await this.db.query((prisma) =>
      prisma.adoption.findUnique({
        where: { id: adoptionId },
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
    return Adoption.fromPersistence({
      id: adoptionRow.id,
      petId: adoptionRow.petId,
      adopterId: adoptionRow.adopterId,
      status: adoptionRow.status as
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "COMPLETED",
      requestedAt: adoptionRow.requestedAt,
      completedAt: adoptionRow.completedAt,
    })
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
