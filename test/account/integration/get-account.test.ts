import { AccountNotFoundError } from "../../../src/application/errors/account/index.js"
import { GetAccount } from "../../../src/application/usecase/account/get-account.js"
import { Signup } from "../../../src/application/usecase/account/signup.js"
import { JwtTokenGeneratorAdapter } from "../../../src/infra/auth/jwt-token-generator-adapter.js"
import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"
import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"

describe("Get Account", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter
  let repository: AccountRepositoryDatabase
  let signup: Signup
  let getAccount: GetAccount

  beforeAll(async () => {
    const ctx = await startPostgresTestDb()
    prisma = ctx.prisma
    db = new PrismaAdapter()
    repository = new AccountRepositoryDatabase(db)
    signup = new Signup(
      repository,
      new BcryptAdapter(),
      new JwtTokenGeneratorAdapter(
        "test-access-secret",
        "test-refresh-secret",
        "15m",
        "7d"
      )
    )
    getAccount = new GetAccount(repository)
  })

  afterEach(async () => {
    await prisma.account.deleteMany({})
  })

  test("should get an account", async () => {
    const inputSignup = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 999999999",
      city: "Campina Grande",
      state: "PB",
    }
    const ouputSignup = await signup.execute(inputSignup)
    const outputGetAccount = await getAccount.execute(ouputSignup.userId)

    expect(outputGetAccount.name).toBe(inputSignup.name)
    expect(outputGetAccount.email).toBe(inputSignup.email)
  })

  test("should throw an error if account not found", async () => {
    const db = new PrismaAdapter()
    const repository = new AccountRepositoryDatabase(db)
    const getAccount = new GetAccount(repository)
    await expect(getAccount.execute("invalid-account-id")).rejects.toThrow(
      new AccountNotFoundError()
    )
  })
})
