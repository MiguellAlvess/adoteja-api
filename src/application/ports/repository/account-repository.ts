import Account from "../../../domain/account/entity/account.js"

export interface AccountRepository {
  add(user: Account): Promise<void>
  findByEmail(email: string): Promise<Account | null>
}
