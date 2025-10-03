import UUID from "../../account/vo/uuid.js"
import PetProfile from "../vo/profile.js"
import PetDetails from "../vo/details.js"
import { PetStatus } from "../pet-status.js"

export default class Pet {
  private id: UUID
  private ownerId: UUID
  private profile: PetProfile
  private details: PetDetails
  private status: PetStatus

  constructor(
    id: string,
    ownerId: string,
    name: string,
    species: string,
    gender: string,
    age: number,
    size: string,
    description?: string | null,
    photoUrl?: string | null,
    status: PetStatus = PetStatus.AVAILABLE
  ) {
    this.id = new UUID(id)
    this.ownerId = new UUID(ownerId)
    this.profile = PetProfile.create(name, species, gender, age, size)
    this.details = PetDetails.create(description ?? null, photoUrl ?? null)
    this.status = status
  }

  static create(
    ownerId: string,
    name: string,
    species: string,
    gender: string,
    age: number,
    size: string,
    description?: string | null,
    photoUrl?: string | null
  ) {
    const id = UUID.create().getValue()
    return new Pet(
      id,
      ownerId,
      name,
      species,
      gender,
      age,
      size,
      description ?? null,
      photoUrl ?? null
    )
  }

  update(data: {
    name?: string
    species?: string
    gender?: string
    age?: number
    size?: string
    description?: string | null
    photoUrl?: string | null
    status?: PetStatus
  }) {
    if (data.name || data.species || data.gender || data.age || data.size) {
      this.profile = PetProfile.create(
        data.name ?? this.profile.getName(),
        data.species ?? this.profile.getSpecies(),
        data.gender ?? this.profile.getGender(),
        data.age ?? this.profile.getAge(),
        data.size ?? this.profile.getSize()
      )
    }
    if (data.description !== undefined || data.photoUrl !== undefined) {
      this.details = PetDetails.create(
        data.description !== undefined
          ? data.description
          : this.details.getDescription(),
        data.photoUrl !== undefined ? data.photoUrl : this.details.getPhotoUrl()
      )
    }
    if (data.status) {
      this.status = data.status
    }
  }

  isOwnedBy(userId: string) {
    return this.getOwnerId() === userId
  }

  getId() {
    return this.id.getValue()
  }
  getOwnerId() {
    return this.ownerId.getValue()
  }

  getName() {
    return this.profile.getName()
  }
  getSpecies() {
    return this.profile.getSpecies()
  }
  getGender() {
    return this.profile.getGender()
  }
  getAge() {
    return this.profile.getAge()
  }
  getSize() {
    return this.profile.getSize()
  }

  getDescription() {
    return this.details.getDescription()
  }
  getPhotoUrl() {
    return this.details.getPhotoUrl()
  }

  getStatus() {
    return this.status
  }
}
