import { describe, afterAll, afterEach, test, expect } from "vitest"

import { Signup } from "../../../src/application/usecase/account/signup.js"
import { JwtTokenGeneratorAdapter } from "../../../src/infra/auth/jwt-token-generator-adapter.js"
import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"
import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"

const ACCESS_SECRET = "test-access-secret"
const REFRESH_SECRET = "test-refresh-secret"

describe("Signup (integration)", () => {
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

  test("should return the accessToken and refreshToken successfully", async () => {
    const input = {
      name: "Robert Martin",
      email: `user-${Math.random()}@example.com`,
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
})
