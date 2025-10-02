import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"
import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"
import { PetRepositoryDatabase } from "../../../src/infra/repository/pet/pet-repository.js"
import { Signup } from "../../../src/application/usecase/account/signup.js"
import { CreatePet } from "../../../src/application/usecase/pet/create-pet.js"
import { GetPet } from "../../../src/application/usecase/pet/get-pet.js"
import { JwtTokenGeneratorAdapter } from "../../../src/infra/auth/jwt-token-generator-adapter.js"
import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"
import { PetNotFoundError } from "../../../src/application/errors/pet/index.js"
import { Cache } from "../../../src/application/ports/cache/cache.js"

class PhotoStorageStub {
  async upload() {
    return "http://cdn.local/pets/photo.jpg"
  }
}

class InMemoryCache implements Cache {
  private store = new Map<
    string,
    { value: unknown; expiresAt: number | null }
  >()

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key)
      return null
    }
    return entry.value as T
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null
    this.store.set(key, { value, expiresAt })
  }

  async del(key: string): Promise<void> {
    this.store.delete(key)
  }
}

describe("GetPet", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter
  let accountRepository: AccountRepositoryDatabase
  let petRepository: PetRepositoryDatabase
  let signup: Signup
  let createPet: CreatePet
  let getPet: GetPet

  beforeAll(async () => {
    const ctx = await startPostgresTestDb()
    prisma = ctx.prisma
    process.env.DATABASE_URL = ctx.url

    db = new PrismaAdapter()
    accountRepository = new AccountRepositoryDatabase(db)
    petRepository = new PetRepositoryDatabase(db)

    signup = new Signup(
      accountRepository,
      new BcryptAdapter(),
      new JwtTokenGeneratorAdapter("test-access", "test-refresh", "15m", "7d")
    )
    createPet = new CreatePet(
      petRepository,
      new PhotoStorageStub(),
      new InMemoryCache()
    )
    getPet = new GetPet(petRepository)
  })

  afterEach(async () => {
    await prisma.pet.deleteMany({})
    await prisma.account.deleteMany({})
  })

  test("should get a pet", async () => {
    const ownerInput = await signup.execute({
      name: "Owner",
      email: `owner-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    })

    const created = await createPet.execute({
      ownerId: ownerInput.userId,
      name: "Spike",
      species: "Dog",
      gender: "MALE",
      age: 3,
      size: "SMALL",
      description: "Cute",
      photo: null,
    })
    const output = await getPet.execute(created.petId)
    expect(output.petId).toBe(created.petId)
    expect(output.ownerId).toBe(ownerInput.userId)
    expect(output.name).toBe("Spike")
    expect(output.status).toBe("AVAILABLE")
  })

  test("should throw PetNotFoundError when pet is not found", async () => {
    await expect(getPet.execute("invalid-id")).rejects.toBeInstanceOf(
      PetNotFoundError
    )
  })
})
