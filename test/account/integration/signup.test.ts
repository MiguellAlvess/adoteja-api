import { describe, afterAll, afterEach, test, expect } from "vitest"

import { Signup } from "../../../src/application/usecase/account/signup.js"
import { JwtTokenGeneratorAdapter } from "../../../src/infra/auth/jwt-token-generator-adapter.js"
import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"
import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"
import { EmailAlreadyExistsError } from "../../../src/application/errors/account/index.js"
import { GetAccount } from "../../../src/application/usecase/account/get-account.js"

const ACCESS_SECRET = "test-access-secret"
const REFRESH_SECRET = "test-refresh-secret"

describe("Signup", () => {
  const db = new PrismaAdapter()
  const repository = new AccountRepositoryDatabase(db)
  const hasher = new BcryptAdapter()
  const tokenGenerator = new JwtTokenGeneratorAdapter(
    ACCESS_SECRET,
    REFRESH_SECRET,
    "15m",
    "7d"
  )
  const signup = new Signup(repository, hasher, tokenGenerator)

  afterEach(async () => {
    await db.query((prisma) =>
      prisma.account.deleteMany({
        where: { email: { contains: "@example.com" } },
      })
    )
  })

  afterAll(async () => {
    await db.close()
  })

  test("should signup a new user successfully", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 999999999",
      city: "Campina Grande",
      state: "PB",
    }

    const outputSignup = await signup.execute(input)
    const getAccount = new GetAccount(repository)
    const outputGetAccount = await getAccount.execute(outputSignup.userId)

    expect(outputSignup.userId).toBeDefined()
    expect(outputGetAccount?.name).toBe(input.name)
    expect(outputGetAccount?.email).toBe(input.email)
    expect(outputGetAccount?.city).toBe(input.city)
    expect(outputGetAccount?.state).toBe(input.state)
  })

  test("should return the accessToken and refreshToken successfully", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 999999999",
      city: "Campina Grande",
      state: "PB",
    }

    const output = await signup.execute(input)

    expect(output.userId).toBeDefined()
    expect(output.accessToken).toBeDefined()
    expect(output.refreshToken).toBeDefined()
  })

  test("should not allow duplicate email", async () => {
    const email = `dup-${Math.random()}@example.com`
    const firstAccount = {
      name: "User One",
      email,
      password: "ValidPassword123",
      phone: "(83) 996049805",
      city: "Campina Grande",
      state: "PB",
    }
    const secondAccount = { ...firstAccount, name: "User Two" }

    await signup.execute(firstAccount)

    await expect(signup.execute(secondAccount)).rejects.toBeInstanceOf(
      EmailAlreadyExistsError
    )
  })
})
