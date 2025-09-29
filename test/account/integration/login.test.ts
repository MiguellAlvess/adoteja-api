import { describe, test, expect, beforeAll, afterEach } from "vitest"
import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"
import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"

import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"
import { JwtTokenGeneratorAdapter } from "../../../src/infra/auth/jwt-token-generator-adapter.js"

import { Signup } from "../../../src/application/usecase/account/signup.js"
import { Login } from "../../../src/application/usecase/account/login.js"
import { InvalidCredentialsError } from "../../../src/application/errors/auth/index.js"

const ACCESS_SECRET = "test-access-secret"
const REFRESH_SECRET = "test-refresh-secret"

describe("Login", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter
  let repository: AccountRepositoryDatabase
  let signup: Signup
  let login: Login

  beforeAll(async () => {
    const ctx = await startPostgresTestDb()
    prisma = ctx.prisma
    process.env.DATABASE_URL = ctx.url

    db = new PrismaAdapter()
    repository = new AccountRepositoryDatabase(db)

    const hasher = new BcryptAdapter()
    const tokenGen = new JwtTokenGeneratorAdapter(
      ACCESS_SECRET,
      REFRESH_SECRET,
      "15m",
      "7d"
    )

    signup = new Signup(repository, hasher, tokenGen)
    login = new Login(repository, hasher, tokenGen)
  })

  afterEach(async () => {
    await prisma.account.deleteMany({})
  })

  test("should login successfully and return tokens", async () => {
    const input = {
      name: "Robert Martin",
      email: `login-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-9999",
      city: "Campina Grande",
      state: "PB",
    }
    const outSignup = await signup.execute(input)
    const outLogin = await login.execute({
      email: input.email,
      password: input.password,
    })
    expect(outLogin.userId).toBe(outSignup.userId)
    expect(outLogin.accessToken).toBeDefined()
    expect(outLogin.refreshToken).toBeDefined()
  })
  test("should throw InvalidCredentialsError when password is wrong", async () => {
    const input = {
      name: "Kent Beck",
      email: `login-wrongpass-${Math.random()}@example.com`,
      password: "CorrectPassword123",
      phone: "(83) 98888-8888",
      city: "Campina Grande",
      state: "PB",
    }
    await signup.execute(input)
    await expect(
      login.execute({
        email: input.email,
        password: "WrongPassword999",
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
