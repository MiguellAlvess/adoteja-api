import Account from "../../../domain/account/entity/account.js"
import { EmailAlreadyExistsError } from "../../errors/account/index.js"
import { TokenGenerator } from "../../ports/auth/token-generator.js"
import { PasswordHasher } from "../../ports/crypto/password-hasher.js"
import { AccountRepository } from "../../ports/repository/account-repository.js"

export class Signup {
  constructor(
    private accountRepository: AccountRepository,
    private passwordHash: PasswordHasher,
    private tokenGenerator: TokenGenerator
  ) {}

  async execute(input: Input): Promise<Output> {
    const account = Account.create(
      input.name,
      input.email,
      await this.passwordHash.hash(input.password),
      input.phone,
      input.city,
      input.state
    )
    const emailAlreadyExists = await this.accountRepository.findByEmail(
      account.getEmail()
    )
    if (emailAlreadyExists) {
      throw new EmailAlreadyExistsError()
    }
    await this.accountRepository.add(account)
    const tokenGenerator = await this.tokenGenerator.generateForAccount(
      account.getAccountId()
    )
    return {
      userId: account.getAccountId(),
      accessToken: tokenGenerator.accessToken,
      refreshToken: tokenGenerator.refreshToken,
    }
  }
}

type Input = {
  name: string
  email: string
  password: string
  phone: string
  city: string
  state: string
}

type Output = {
  userId: string
  accessToken: string
  refreshToken: string
}
