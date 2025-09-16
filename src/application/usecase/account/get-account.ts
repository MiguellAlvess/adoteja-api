import { AccountNotFoundError } from "../../errors/account/index.js"
import { AccountRepository } from "../../ports/repository/account-repository.js"

export class GetAccount {
  constructor(private accountRepository: AccountRepository) {}

  async execute(accountId: string): Promise<Output> {
    const account = await this.accountRepository.findById(accountId)
    if (!account) {
      throw new AccountNotFoundError()
    }
    return {
      name: account.getName(),
      email: account.getEmail(),
      phone: account.getPhone(),
      city: account.getCity(),
      state: account.getState(),
    }
  }
}

type Output = {
  name: string
  email: string
  phone: string
  city: string
  state: string
}
