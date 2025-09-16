import { AccountRepository } from "../../../application/ports/repository/account-repository.js"
import Account from "../../../domain/account/entity/account.js"

import DatabaseConnection from "../../database/database-connection.js"

export class AccountRepositoryDatabase implements AccountRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async add(account: Account): Promise<void> {
    await this.db.query((prisma) =>
      prisma.account.create({
        data: {
          id: account.getAccountId(),
          name: account.getName(),
          email: account.getEmail(),
          passwordHash: account.getPasswordHash(),
          phone: account.getPhone(),
          city: account.getCity(),
          state: account.getState(),
        },
      })
    )
  }

  async findByEmail(email: string): Promise<Account | null> {
    const accountRow = await this.db.query((prisma) =>
      prisma.account.findUnique({ where: { email } })
    )
    if (!accountRow) return null

    return new Account(
      accountRow.id,
      accountRow.name,
      accountRow.email,
      accountRow.passwordHash,
      accountRow.phone,
      accountRow.city,
      accountRow.state
    )
  }
}
