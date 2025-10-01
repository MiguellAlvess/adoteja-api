import { DomainError } from "../domain-error.js"

export class InvalidPetNameError extends DomainError {
  constructor() {
    super("Invalid pet name", "INVALID_PET_NAME")
  }
}

export class InvalidSpeciesError extends DomainError {
  constructor() {
    super("Invalid species", "INVALID_SPECIES")
  }
}

export class InvalidGenderError extends DomainError {
  constructor() {
    super("Invalid gender", "INVALID_GENDER")
  }
}

export class InvalidAgeError extends DomainError {
  constructor() {
    super("Invalid age", "INVALID_AGE")
  }
}

export class InvalidSizeError extends DomainError {
  constructor() {
    super("Invalid size", "INVALID_SIZE")
  }
}

export class InvalidDescriptionError extends DomainError {
  constructor() {
    super("Invalid description", "INVALID_DESCRIPTION")
  }
}

export class InvalidPhotoUrlError extends DomainError {
  constructor() {
    super("Invalid photo URL", "INVALID_PHOTO_URL")
  }
}
