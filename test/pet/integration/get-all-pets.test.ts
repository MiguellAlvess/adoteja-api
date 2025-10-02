import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"
import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"
import { PetRepositoryDatabase } from "../../../src/infra/repository/pet/pet-repository.js"
import { Signup } from "../../../src/application/usecase/account/signup.js"
import { CreatePet } from "../../../src/application/usecase/pet/create-pet.js"
import { JwtTokenGeneratorAdapter } from "../../../src/infra/auth/jwt-token-generator-adapter.js"
import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"
import { GetAllPets } from "../../../src/application/usecase/pet/get-all.js"
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

describe("GetAllPets (use case)", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter
  let accountRepository: AccountRepositoryDatabase
  let petRepository: PetRepositoryDatabase
  let signup: Signup
  let createPet: CreatePet
  let getAllPets: GetAllPets

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
    getAllPets = new GetAllPets(petRepository, new InMemoryCache(), 60)
  })

  afterEach(async () => {
    await prisma.pet.deleteMany({})
    await prisma.account.deleteMany({})
  })

  test("should return all pets that exist", async () => {
    const owner1 = await signup.execute({
      name: "Owner One",
      email: `owner1-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    })
    const owner2 = await signup.execute({
      name: "Owner Two",
      email: `owner2-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    })
    await createPet.execute({
      ownerId: owner1.userId,
      name: "Spike",
      species: "Dog",
      gender: "MALE",
      age: 3,
      size: "SMALL",
      description: "Cute",
      photo: null,
    })
    await createPet.execute({
      ownerId: owner1.userId,
      name: "Luna",
      species: "Cat",
      gender: "FEMALE",
      age: 2,
      size: "SMALL",
      description: "Playful",
      photo: null,
    })
    await createPet.execute({
      ownerId: owner2.userId,
      name: "Thor",
      species: "Dog",
      gender: "MALE",
      age: 4,
      size: "MEDIUM",
      description: "Loyal",
      photo: null,
    })
    const output = await getAllPets.execute()
    expect(output.length).toBe(3)
    expect(output).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Spike", species: "Dog" }),
        expect.objectContaining({ name: "Luna", species: "Cat" }),
        expect.objectContaining({ name: "Thor", species: "Dog" }),
      ])
    )
  })
})
