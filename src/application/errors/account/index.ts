export class EmailAlreadyExistsError extends Error {
  constructor() {
    super("Email already exists")
  }
}

export class AccountNotFoundError extends Error {
  constructor() {
    super("Account not found")
  }
}
