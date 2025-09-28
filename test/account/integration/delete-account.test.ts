import { AccountNotFoundError } from "../../../src/application/errors/account/index.js"
import { DeleteAccount } from "../../../src/application/usecase/account/delete-account.js"
import { Signup } from "../../../src/application/usecase/account/signup.js"
import { JwtTokenGeneratorAdapter } from "../../../src/infra/auth/jwt-token-generator-adapter.js"
import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"
import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"

describe("Delete Account", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter
  let repository: AccountRepositoryDatabase
  let signup: Signup
  let deleteAccount: DeleteAccount

  beforeAll(async () => {
    const ctx = await startPostgresTestDb()
    prisma = ctx.prisma
    db = new PrismaAdapter()
    process.env.DATABASE_URL = ctx.url
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
    deleteAccount = new DeleteAccount(repository)
  })

  afterEach(async () => {
    await prisma.account.deleteMany({})
  })
  test("should delete an account", async () => {
    const signupInput = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 999999999",
      city: "Campina Grande",
      state: "PB",
    }
    const outputSignup = await signup.execute(signupInput)
    const outputDeleteAccount = await deleteAccount.execute(outputSignup.userId)
    const row = await prisma.account.findUnique({
      where: { id: outputSignup.userId },
    })
    expect(row).toBeNull()
    expect(outputDeleteAccount).toBeUndefined()
  })

  test("should throw an error if account not found", async () => {
    const accountId = "7fa98d15-9b93-415a-a868-b679c3902a99"
    await expect(deleteAccount.execute(accountId)).rejects.toThrow(
      new AccountNotFoundError()
    )
  })
})
