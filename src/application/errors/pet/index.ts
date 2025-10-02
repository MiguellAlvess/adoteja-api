export class PetNotFoundError extends Error {
  constructor() {
    super("Pet not found")
  }
}

export class NotPetOwnerError extends Error {
  constructor() {
    super("Only the owner can delete this pet")
  }
}
