import {
  AccountNotFoundError,
  EmailAlreadyExistsError,
} from "../../../src/application/errors/account/index.js"
import { Signup } from "../../../src/application/usecase/account/signup.js"
import { UpdateAccount } from "../../../src/application/usecase/account/update-account.js"
import { JwtTokenGeneratorAdapter } from "../../../src/infra/auth/jwt-token-generator-adapter.js"
import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"
import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"

describe("Update Account", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter
  let repository: AccountRepositoryDatabase
  let signup: Signup
  let updateAccount: UpdateAccount

  beforeAll(async () => {
    const ctx = await startPostgresTestDb()
    prisma = ctx.prisma
    process.env.DATABASE_URL = ctx.url
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
    updateAccount = new UpdateAccount(repository, new BcryptAdapter())
  })

  afterEach(async () => {
    await prisma.account.deleteMany({})
  })

  test("should update an account", async () => {
    const inputSignup = {
      name: "Robert Martin",
      email: `test@example.com`,
      password: "ValidPassword123",
      phone: "(99) 999999999",
      city: "Campina Grande",
      state: "PB",
    }
    const outputSignup = await signup.execute(inputSignup)
    const accountId = outputSignup.userId
    const inputUpdate = {
      accountId,
      name: "Robert Martin Updated",
      email: `testupdated@example.com`,
      password: "UpdatedPassword123",
      phone: "(83) 988888888",
      city: "João Pessoa",
      state: "PB",
    }
    const outputUpdate = await updateAccount.execute(inputUpdate)
    const updated = await repository.findById(accountId)
    expect(outputUpdate.id).toBe(accountId)
    expect(updated?.getName()).toBe("Robert Martin Updated")
    expect(updated?.getEmail()).toBe("testupdated@example.com")
    expect(updated?.getPhone()).toBe("(83) 988888888")
    expect(updated?.getCity()).toBe("João Pessoa")
    expect(updated?.getState()).toBe("PB")
  })

  test("should throw an error if account not found", async () => {
    const inputUpdate = {
      accountId: "7fa98d15-9b93-415a-a868-b679c3902a99",
      name: "Robert Martin Updated",
      email: `testupdated@example.com`,
      password: "UpdatedPassword123",
      phone: "(83) 988888888",
      city: "João Pessoa",
      state: "PB",
    }
    await expect(updateAccount.execute(inputUpdate)).rejects.toThrow(
      new AccountNotFoundError()
    )
  })

  test("should throw an error if email already exists", async () => {
    const firstAccount = await signup.execute({
      name: "First User",
      email: `a${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 999999999",
      city: "Campina Grande",
      state: "PB",
    })
    const secondEmail = `b${Math.random()}@example.com`
    await signup.execute({
      name: "Second User",
      email: secondEmail,
      password: "ValidPassword123",
      phone: "(99) 999999999",
      city: "Campina Grande",
      state: "PB",
    })
    await expect(
      updateAccount.execute({
        accountId: firstAccount.userId,
        email: secondEmail,
      })
    ).rejects.toThrow(new EmailAlreadyExistsError())
  })
})
