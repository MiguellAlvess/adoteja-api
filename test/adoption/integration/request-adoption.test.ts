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
import {
  AdoptionAlreadyRequestedError,
  PetNotAvailableForAdoptionError,
  PetNotFoundForAdoptionError,
} from "../../../src/application/errors/adoption/index.js"

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

describe("Request Adoption (use case)", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter

  let accountRepository: AccountRepositoryDatabase
  let petRepository: PetRepositoryDatabase
  let adoptionRepository: AdoptionRepositoryDatabase

  let signup: Signup
  let createPet: CreatePet
  let requestAdoption: RequestAdoption

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
  })

  afterEach(async () => {
    await prisma.adoption.deleteMany({})
    await prisma.pet.deleteMany({})
    await prisma.account.deleteMany({})
  })

  test("should create a PENDING adoption request", async () => {
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
      name: "Bolt",
      species: "Dog",
      gender: "MALE",
      age: 4,
      size: "MEDIUM",
      description: "Fast runner",
      photo: null,
    })
    const adoptionOutput = await requestAdoption.execute({
      petId: petOutput.petId,
      adopterId: adopterOutput.userId,
    })
    expect(adoptionOutput.petId).toBe(petOutput.petId)
    expect(adoptionOutput.adopterId).toBe(adopterOutput.userId)
    expect(adoptionOutput.status).toBe("PENDING")
    expect(adoptionOutput.adoptionId).toBeTruthy()
    expect(adoptionOutput.requestedAt instanceof Date).toBe(true)
    const row = await prisma.adoption.findUnique({
      where: { id: adoptionOutput.adoptionId },
      select: { petId: true, adopterId: true, status: true },
    })
    expect(row).toBeTruthy()
    expect(row?.petId).toBe(petOutput.petId)
    expect(row?.adopterId).toBe(adopterOutput.userId)
    expect(row?.status).toBe("PENDING")
  })

  test("should throw an error when pet not found", async () => {
    const adopter = await signup.execute({
      name: "Adopter",
      email: `adopter-nf-${Date.now()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 90000-0000",
      city: "Campina Grande",
      state: "PB",
    })
    await expect(
      requestAdoption.execute({
        petId: "ac355f06-db61-4e5b-8fef-7e6abb6ce47c",
        adopterId: adopter.userId,
      })
    ).rejects.toThrow(new PetNotFoundForAdoptionError())
  })

  test("should throw when pet is not available", async () => {
    const owner = await signup.execute({
      name: "Owner",
      email: `owner-na-${Date.now()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 95555-0000",
      city: "Campina Grande",
      state: "PB",
    })
    const adopter = await signup.execute({
      name: "Adopter",
      email: `adopter-na-${Date.now()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 96666-0000",
      city: "Campina Grande",
      state: "PB",
    })
    const pet = await createPet.execute({
      ownerId: owner.userId,
      name: "Luna",
      species: "Cat",
      gender: "FEMALE",
      age: 2,
      size: "SMALL",
      description: "Playful",
      photo: null,
    })
    await prisma.pet.update({
      where: { id: pet.petId },
      data: { status: "ADOPTED" },
    })
    await expect(
      requestAdoption.execute({
        petId: pet.petId,
        adopterId: adopter.userId,
      })
    ).rejects.toThrow(new PetNotAvailableForAdoptionError())
  })

  test("should throw when an active request already exists ", async () => {
    const owner = await signup.execute({
      name: "Owner",
      email: `owner-dupl-${Date.now()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 97777-0000",
      city: "Campina Grande",
      state: "PB",
    })
    const adopter = await signup.execute({
      name: "Adopter",
      email: `adopter-dupl-${Date.now()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    })
    const pet = await createPet.execute({
      ownerId: owner.userId,
      name: "Thor",
      species: "Dog",
      gender: "MALE",
      age: 5,
      size: "LARGE",
      description: "Loyal",
      photo: null,
    })
    const first = await requestAdoption.execute({
      petId: pet.petId,
      adopterId: adopter.userId,
    })
    expect(first.status).toBe("PENDING")
    await expect(
      requestAdoption.execute({
        petId: pet.petId,
        adopterId: adopter.userId,
      })
    ).rejects.toThrow(new AdoptionAlreadyRequestedError())
  })
})
