import Account from "../../../domain/account/entity/account.js"

export interface AccountRepository {
  add(account: Account): Promise<void>
  findByEmail(email: string): Promise<Account | null>
  findById(accountId: string): Promise<Account | null>
}
