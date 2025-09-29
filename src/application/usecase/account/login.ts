import { InvalidCredentialsError } from "../../errors/auth/index.js"
import { PasswordHasher } from "../../ports/crypto/password-hasher.js"
import { AccountRepository } from "../../ports/repository/account-repository.js"
import { TokenGenerator } from "../../ports/auth/token-generator.js"

export class Login {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: TokenGenerator
  ) {}

  async execute(input: Input): Promise<Output> {
    const account = await this.accountRepository.findByEmail(input.email)
    if (!account) throw new InvalidCredentialsError()
    const isValid = await this.passwordHasher.compare(
      input.password,
      account.getPasswordHash()
    )
    if (!isValid) throw new InvalidCredentialsError()
    const tokens = await this.tokenGenerator.generateForAccount(
      account.getAccountId()
    )
    return {
      userId: account.getAccountId(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }
}

type Input = { email: string; password: string }

type Output = { userId: string; accessToken: string; refreshToken: string }
