import { DomainError } from "../domain-error.js"

export class InvalidEmailError extends DomainError {
  constructor() {
    super("Invalid email", "INVALID_EMAIL")
  }
}

export class InvalidPasswordError extends DomainError {
  constructor() {
    super("Invalid password", "INVALID_PASSWORD")
  }
}

export class InvalidStateError extends DomainError {
  constructor() {
    super("Invalid state", "INVALID_STATE")
  }
}

export class InvalidCityError extends DomainError {
  constructor() {
    super("Invalid city", "INVALID_CITY")
  }
}

export class InvalidNameError extends DomainError {
  constructor() {
    super("Invalid name", "INVALID_NAME")
  }
}

export class InvalidPhoneNumberError extends DomainError {
  constructor() {
    super("Invalid phone number", "INVALID_PHONE_NUMBER")
  }
}

export class InvalidUUIDError extends DomainError {
  constructor() {
    super("Invalid UUID", "INVALID_UUID")
  }
}

export class InvalidPasswordHashError extends DomainError {
  constructor() {
    super("Invalid password hash", "INVALID_PASSWORD_HASH")
  }
}
