import { AccountNotFoundError } from "../../errors/account/index.js"
import { AccountRepository } from "../../ports/repository/account-repository.js"

export class DeleteAccount {
  constructor(private accountRepository: AccountRepository) {}

  async execute(accountId: string): Promise<void> {
    const existingAccount = await this.accountRepository.findById(accountId)
    if (!existingAccount) {
      throw new AccountNotFoundError()
    }
    await this.accountRepository.delete(accountId)
  }
}
