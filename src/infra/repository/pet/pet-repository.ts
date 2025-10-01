import { PetRepository } from "../../../application/ports/repository/pet-repository.js"
import Pet from "../../../domain/pet/entity/pet.js"
import DatabaseConnection from "../../database/database-connection.js"

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
          status: pet.getStatus(),
          photoUrl: pet.getPhotoUrl(),
        },
      })
    )
  }
}
