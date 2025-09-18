import { describe, test, expect, beforeAll, afterEach } from "vitest"
import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { Signup } from "../../../src/application/usecase/account/signup.js"
import { GetAccount } from "../../../src/application/usecase/account/get-account.js"
import { JwtTokenGeneratorAdapter } from "../../../src/infra/auth/jwt-token-generator-adapter.js"
import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"
import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"
import { EmailAlreadyExistsError } from "../../../src/application/errors/account/index.js"

const ACCESS_SECRET = "test-access-secret"
const REFRESH_SECRET = "test-refresh-secret"

describe("Signup ", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter
  let repository: AccountRepositoryDatabase
  let signup: Signup
  let getAccount: GetAccount

  beforeAll(async () => {
    const ctx = await startPostgresTestDb()
    prisma = ctx.prisma
    process.env.DATABASE_URL = ctx.url
    db = new PrismaAdapter()
    repository = new AccountRepositoryDatabase(db)
    signup = new Signup(
      repository,
      new BcryptAdapter(),
      new JwtTokenGeneratorAdapter(ACCESS_SECRET, REFRESH_SECRET, "15m", "7d")
    )
    getAccount = new GetAccount(repository)
  })

  afterEach(async () => {
    await prisma.account.deleteMany({})
  })

  test("should signup a new user successfully and then get it", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 999999999",
      city: "Campina Grande",
      state: "PB",
    }

    const outSignup = await signup.execute(input)
    const outGet = await getAccount.execute(outSignup.userId)

    expect(outSignup.userId).toBeDefined()
    expect(outSignup.accessToken).toBeDefined()
    expect(outSignup.refreshToken).toBeDefined()
    expect(outGet.name).toBe(input.name)
    expect(outGet.email).toBe(input.email)
    expect(outGet.city).toBe(input.city)
    expect(outGet.state).toBe(input.state)
  })

  test("should not allow duplicate email", async () => {
    const email = `dup-${Math.random()}@example.com`
    await signup.execute({
      name: "User One",
      email,
      password: "ValidPassword123",
      phone: "(83) 996049805",
      city: "Campina Grande",
      state: "PB",
    })

    await expect(
      signup.execute({
        name: "User Two",
        email,
        password: "ValidPassword123",
        phone: "(83) 996049805",
        city: "Campina Grande",
        state: "PB",
      })
    ).rejects.toBeInstanceOf(EmailAlreadyExistsError)
  })
})
