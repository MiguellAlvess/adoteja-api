import Account from "../../../src/domain/account/entity/account.js"
import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"
import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"

describe("Account Repository", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter
  let repository: AccountRepositoryDatabase

  beforeAll(async () => {
    const ctx = await startPostgresTestDb()
    prisma = ctx.prisma
    process.env.DATABASE_URL = ctx.url
    db = new PrismaAdapter()
    repository = new AccountRepositoryDatabase(db)
  })

  afterEach(async () => {
    await prisma.account.deleteMany({})
  })

  test("should persist an account in the database", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      passwordHash: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "PB",
    }
    const bcryptAdapter = new BcryptAdapter()
    input.passwordHash = await bcryptAdapter.hash(input.passwordHash)
    const account = Account.create(
      input.name,
      input.email,
      input.passwordHash,
      input.phone,
      input.city,
      input.state
    )
    await repository.add(account)
    const accountCreated = await repository.findById(account.getAccountId())
    expect(accountCreated?.getAccountId()).toBe(account.getAccountId())
    expect(accountCreated?.getName()).toBe(account.getName())
    expect(accountCreated?.getEmail()).toBe(account.getEmail())
    expect(accountCreated?.getPhone()).toBe(account.getPhone())
    expect(accountCreated?.getCity()).toBe(account.getCity())
    expect(accountCreated?.getState()).toBe(account.getState())
  })
})
