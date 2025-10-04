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
import { GetAdoption } from "../../../src/application/usecase/adoption/get-adoption.js"

import type {
  PhotoInput,
  PhotoStorage,
} from "../../../src/application/ports/storage/photo-storage.js"
import type { Cache } from "../../../src/application/ports/cache/cache.js"
import { AdoptionNotFoundError } from "../../../src/application/errors/adoption/index.js"

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

describe("Get Adoption", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter

  let accountRepository: AccountRepositoryDatabase
  let petRepository: PetRepositoryDatabase
  let adoptionRepository: AdoptionRepositoryDatabase

  let signup: Signup
  let createPet: CreatePet
  let requestAdoption: RequestAdoption
  let getAdoption: GetAdoption

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
    const cache = new InMemoryCache()
    createPet = new CreatePet(petRepository, photoStorage, cache)

    requestAdoption = new RequestAdoption(petRepository, adoptionRepository)
    getAdoption = new GetAdoption(adoptionRepository)
  })

  afterEach(async () => {
    await prisma.adoption.deleteMany({})
    await prisma.pet.deleteMany({})
    await prisma.account.deleteMany({})
  })

  test("should return an adoption by id", async () => {
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
    const petOutput = await createPet.execute({
      ownerId: ownerOutput.userId,
      name: "Spike",
      species: "Dog",
      gender: "MALE",
      age: 3,
      size: "SMALL",
      description: "Adorable",
      photo: null,
    })
    const requestInput = {
      petId: petOutput.petId,
      adopterId: adopterOutput.userId,
    }
    const requestOutput = await requestAdoption.execute(requestInput)
    const getOutput = await getAdoption.execute(requestOutput.adoptionId)
    expect(getOutput.id).toBe(requestOutput.adoptionId)
    expect(getOutput.petId).toBe(petOutput.petId)
    expect(getOutput.adopterId).toBe(adopterOutput.userId)
    expect(getOutput.status).toBe("PENDING")
  })

  test("should throw AdoptionNotFoundError when id does not exist", async () => {
    const inputId = "d7577128-eb5d-4763-bb1a-c444aca3f155"
    await expect(getAdoption.execute(inputId)).rejects.toThrow(
      new AdoptionNotFoundError()
    )
  })

  test("should reflect persisted fields correctly", async () => {
    const ownerOutput = await signup.execute({
      name: "Owner",
      email: `owner2-${Date.now()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 90000-0000",
      city: "Campina Grande",
      state: "PB",
    })
    const adopterOutput = await signup.execute({
      name: "Adopter",
      email: `adopter2-${Date.now()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 91111-1111",
      city: "Campina Grande",
      state: "PB",
    })
    const petOutput = await createPet.execute({
      ownerId: ownerOutput.userId,
      name: "Luna",
      species: "Cat",
      gender: "FEMALE",
      age: 2,
      size: "SMALL",
      description: "Playful",
      photo: null,
    })
    const requestOutput = await requestAdoption.execute({
      petId: petOutput.petId,
      adopterId: adopterOutput.userId,
    })
    const adoptionRow = await prisma.adoption.findUnique({
      where: { id: requestOutput.adoptionId },
      select: { id: true, petId: true, adopterId: true, status: true },
    })
    expect(adoptionRow).toBeTruthy()
    const getOutput = await getAdoption.execute(requestOutput.adoptionId)
    expect(getOutput.id).toBe(adoptionRow!.id)
    expect(getOutput.petId).toBe(adoptionRow!.petId)
    expect(getOutput.adopterId).toBe(adoptionRow!.adopterId)
    expect(getOutput.status).toBe("PENDING")
  })
})
