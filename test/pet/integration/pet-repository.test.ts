import { describe, test, expect, beforeAll, afterEach } from "vitest"
import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"

import { PetRepositoryDatabase } from "../../../src/infra/repository/pet/pet-repository.js"
import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"

import Account from "../../../src/domain/account/entity/account.js"
import Pet from "../../../src/domain/pet/entity/pet.js"
import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"

describe("Pet Repository", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter
  let petRepository: PetRepositoryDatabase
  let accountRepository: AccountRepositoryDatabase

  beforeAll(async () => {
    const ctx = await startPostgresTestDb()
    prisma = ctx.prisma
    process.env.DATABASE_URL = ctx.url

    db = new PrismaAdapter()
    petRepository = new PetRepositoryDatabase(db)
    accountRepository = new AccountRepositoryDatabase(db)
  })

  afterEach(async () => {
    await prisma.pet.deleteMany({})
    await prisma.account.deleteMany({})
  })

  test("should persist a pet in the database (without photo)", async () => {
    const bcrypt = new BcryptAdapter()
    const owner = Account.create(
      "Owner One",
      `owner-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 99999-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(owner)
    const pet = Pet.create(
      owner.getAccountId(),
      "Spike",
      "Dog",
      "MALE",
      5,
      "SMALL",
      "Adorable and friendly dog",
      null
    )
    await petRepository.add(pet)
    const row = await prisma.pet.findUnique({ where: { id: pet.getId() } })
    expect(row).toBeTruthy()
    expect(row?.ownerId).toBe(owner.getAccountId())
    expect(row?.name).toBe("Spike")
    expect(row?.species).toBe("Dog")
    expect(row?.gender).toBe("MALE")
    expect(row?.age).toBe(5)
    expect(row?.size).toBe("SMALL")
    expect(row?.description).toBe("Adorable and friendly dog")
    expect(row?.photoUrl).toBeNull()
    expect(row?.status).toBe("AVAILABLE")
  })

  test("should persist a pet in the database (with photo)", async () => {
    const bcrypt = new BcryptAdapter()
    const owner = Account.create(
      "Owner Two",
      `owner2-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 98888-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(owner)
    const pet = Pet.create(
      owner.getAccountId(),
      "Luna",
      "Cat",
      "FEMALE",
      2,
      "SMALL",
      "Playful kitten",
      "http://cdn.local/pets/luna.jpg"
    )
    await petRepository.add(pet)
    const row = await prisma.pet.findUnique({ where: { id: pet.getId() } })
    expect(row).toBeTruthy()
    expect(row?.ownerId).toBe(owner.getAccountId())
    expect(row?.name).toBe("Luna")
    expect(row?.species).toBe("Cat")
    expect(row?.gender).toBe("FEMALE")
    expect(row?.age).toBe(2)
    expect(row?.size).toBe("SMALL")
    expect(row?.description).toBe("Playful kitten")
    expect(row?.photoUrl).toBe("http://cdn.local/pets/luna.jpg")
    expect(row?.status).toBe("AVAILABLE")
  })
})
