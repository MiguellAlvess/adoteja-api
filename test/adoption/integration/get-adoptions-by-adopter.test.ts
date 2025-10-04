import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"
import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"
import { PetRepositoryDatabase } from "../../../src/infra/repository/pet/pet-repository.js"
import { AdoptionRepositoryDatabase } from "../../../src/infra/repository/adoption/adoption-repository.js"
import { JwtTokenGeneratorAdapter } from "../../../src/infra/auth/jwt-token-generator-adapter.js"
import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"
import { Signup } from "../../../src/application/usecase/account/signup.js"
import { CreatePet } from "../../../src/application/usecase/pet/create-pet.js"
import { RequestAdoption } from "../../../src/application/usecase/adoption/request-adoption.js"
import type {
  PhotoInput,
  PhotoStorage,
} from "../../../src/application/ports/storage/photo-storage.js"
import { Cache } from "../../../src/application/ports/cache/cache.js"
import { GetAdoptionsByAdopter } from "../../../src/application/usecase/adoption/get-adoptions-by-adopter.js"

const ACCESS_SECRET = "test-access-secret"
const REFRESH_SECRET = "test-refresh-secret"

class PhotoStorageStub implements PhotoStorage {
  public lastUploaded?: PhotoInput
  constructor(
    private readonly urlToReturn: string = "http://cdn.local/pets/photo.jpg"
  ) {}
  async upload(input: PhotoInput): Promise<string> {
    this.lastUploaded = input
    return this.urlToReturn
  }
}

class InMemoryCache implements Cache {
  private store = new Map<
    string,
    { value: unknown; expiresAt: number | null }
  >()
  async get<T>(key: string): Promise<T | null> {
    const e = this.store.get(key)
    if (!e) return null
    if (e.expiresAt && e.expiresAt < Date.now()) {
      this.store.delete(key)
      return null
    }
    return e.value as T
  }
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : null
    this.store.set(key, { value, expiresAt })
  }
  async del(key: string): Promise<void> {
    this.store.delete(key)
  }
}

describe("Get Adoptions By User", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter

  let accountRepository: AccountRepositoryDatabase
  let petRepository: PetRepositoryDatabase
  let adoptionRepository: AdoptionRepositoryDatabase

  let signup: Signup
  let createPet: CreatePet
  let requestAdoption: RequestAdoption
  let getAdoptionsByAdopter: GetAdoptionsByAdopter

  beforeAll(async () => {
    const ctx = await startPostgresTestDb()
    prisma = ctx.prisma
    process.env.DATABASE_URL = ctx.url

    db = new PrismaAdapter()
    accountRepository = new AccountRepositoryDatabase(db)
    petRepository = new PetRepositoryDatabase(db)
    adoptionRepository = new AdoptionRepositoryDatabase(db)

    signup = new Signup(
      accountRepository,
      new BcryptAdapter(),
      new JwtTokenGeneratorAdapter(ACCESS_SECRET, REFRESH_SECRET, "15m", "7d")
    )

    const photoStorage = new PhotoStorageStub()
    createPet = new CreatePet(petRepository, photoStorage, new InMemoryCache())
    requestAdoption = new RequestAdoption(petRepository, adoptionRepository)
    getAdoptionsByAdopter = new GetAdoptionsByAdopter(adoptionRepository)
  })

  afterEach(async () => {
    await prisma.adoption.deleteMany({})
    await prisma.pet.deleteMany({})
    await prisma.account.deleteMany({})
  })

  test("should get user adoptions", async () => {
    const ownerOutput = await signup.execute({
      name: "Owner",
      email: `owner-${Date.now()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    })
    const adopterOutput = await signup.execute({
      name: "Adopter",
      email: `adopter-${Date.now()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    })

    const pet1 = await createPet.execute({
      ownerId: ownerOutput.userId,
      name: "Bolt",
      species: "Dog",
      gender: "MALE",
      age: 4,
      size: "MEDIUM",
      description: "Fast",
      photo: null,
    })
    const pet2 = await createPet.execute({
      ownerId: ownerOutput.userId,
      name: "Luna",
      species: "Cat",
      gender: "FEMALE",
      age: 2,
      size: "SMALL",
      description: "Playful",
      photo: null,
    })

    const adoption1 = await requestAdoption.execute({
      petId: pet1.petId,
      adopterId: adopterOutput.userId,
    })
    const adoption2 = await requestAdoption.execute({
      petId: pet2.petId,
      adopterId: adopterOutput.userId,
    })
    expect(adoption1.status).toBe("PENDING")
    expect(adoption2.status).toBe("PENDING")
    const output = await getAdoptionsByAdopter.execute(adopterOutput.userId)
    expect(Array.isArray(output)).toBe(true)
    expect(output.length).toBe(2)
  })
})
