import {
  AccountNotFoundError,
  EmailAlreadyExistsError,
} from "../../errors/account/index.js"
import { PasswordHasher } from "../../ports/crypto/password-hasher.js"
import { AccountRepository } from "../../ports/repository/account-repository.js"

export class UpdateAccount {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: Input): Promise<Output> {
    const account = await this.accountRepository.findById(input.accountId)
    if (!account) throw new AccountNotFoundError()
    if (input.email) {
      const accountWithEmail = await this.accountRepository.findByEmail(
        input.email
      )
      if (
        accountWithEmail &&
        accountWithEmail.getAccountId() !== input.accountId
      ) {
        throw new EmailAlreadyExistsError()
      }
    }
    let newPasswordHash: string | undefined
    if (input.password) {
      newPasswordHash = await this.passwordHasher.hash(input.password)
    }
    account.update({
      name: input.name,
      email: input.email,
      phone: input.phone,
      city: input.city,
      state: input.state,
      passwordHash: newPasswordHash,
    })
    await this.accountRepository.update(account)
    return { id: account.getAccountId() }
  }
}

type Input = {
  accountId: string
  name?: string
  email?: string
  phone?: string
  city?: string
  state?: string
  password?: string
}

type Output = { id: string }
