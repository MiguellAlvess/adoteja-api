export class PetNotFoundForAdoptionError extends Error {
  constructor() {
    super("Pet not found")
  }
}
export class PetNotAvailableForAdoptionError extends Error {
  constructor() {
    super("Pet is not available for adoption")
  }
}
export class AdoptionAlreadyRequestedError extends Error {
  constructor() {
    super("Adoption already requested by this adopter for this pet")
  }
}
