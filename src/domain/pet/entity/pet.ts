import { PetStatus } from "@prisma/client"
import UUID from "../../account/vo/uuid.js"
import Age from "../vo/age.js"
import Description from "../vo/description.js"
import Gender from "../vo/gender.js"
import PetName from "../vo/name.js"
import PhotoUrl from "../vo/photo-url.js"
import Size from "../vo/size.js"
import Species from "../vo/species.js"

export default class Pet {
  private id: UUID
  private ownerId: UUID
  private name: PetName
  private species: Species
  private gender: Gender
  private age: Age
  private size: Size
  private description?: Description
  private photoUrl?: PhotoUrl
  private status: PetStatus

  constructor(
    id: string,
    ownerId: string,
    name: string,
    species: string,
    gender: string,
    age: number,
    size: string,
    description?: string,
    photoUrl?: string,
    status: PetStatus = PetStatus.AVAILABLE
  ) {
    this.id = new UUID(id)
    this.ownerId = new UUID(ownerId)
    this.name = new PetName(name)
    this.species = new Species(species)
    this.gender = new Gender(gender)
    this.age = new Age(age)
    this.size = new Size(size)
    this.description = description ? new Description(description) : undefined
    this.photoUrl = photoUrl ? new PhotoUrl(photoUrl) : undefined
    this.status = status
  }

  static create(
    ownerId: string,
    name: string,
    species: string,
    gender: string,
    age: number,
    size: string,
    description?: string,
    photoUrl?: string
  ): Pet {
    const id = UUID.create().getValue()
    return new Pet(
      id,
      ownerId,
      name,
      species,
      gender,
      age,
      size,
      description,
      photoUrl
    )
  }

  getId() {
    return this.id.getValue()
  }

  getOwnerId() {
    return this.ownerId.getValue()
  }

  getName() {
    return this.name.getValue()
  }

  getSpecies() {
    return this.species.getValue()
  }

  getGender() {
    return this.gender.getValue()
  }

  getAge() {
    return this.age.getValue()
  }

  getSize() {
    return this.size.getValue()
  }

  getDescription() {
    return this.description?.getValue()
  }

  getPhotoUrl() {
    return this.photoUrl?.getValue()
  }

  getStatus() {
    return this.status
  }
}
