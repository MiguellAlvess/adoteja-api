export class InvalidPetNameError extends Error {
  constructor() {
    super("Invalid pet name")
    this.name = "InvalidPetNameError"
  }
}

export class InvalidSpeciesError extends Error {
  constructor() {
    super("Invalid species")
    this.name = "InvalidSpeciesError"
  }
}

export class InvalidGenderError extends Error {
  constructor() {
    super('Invalid gender. Use "MALE", "FEMALE" or "UNKNOWN"')
    this.name = "InvalidGenderError"
  }
}

export class InvalidAgeError extends Error {
  constructor() {
    super("Invalid age")
    this.name = "InvalidAgeError"
  }
}

export class InvalidSizeError extends Error {
  constructor() {
    super('Invalid size. Use "SMALL", "MEDIUM" or "LARGE"')
    this.name = "InvalidSizeError"
  }
}

export class InvalidDescriptionError extends Error {
  constructor() {
    super("Invalid description")
    this.name = "InvalidDescriptionError"
  }
}

export class InvalidPhotoUrlError extends Error {
  constructor() {
    super("Invalid photo URL")
    this.name = "InvalidPhotoUrlError"
  }
}
