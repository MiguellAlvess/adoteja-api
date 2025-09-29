export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized")
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super()
    this.name = "InvalidCredentialsError"
  }
}
