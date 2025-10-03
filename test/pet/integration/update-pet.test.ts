import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"
import { Signup } from "../../../src/application/usecase/account/signup.js"
import { JwtTokenGeneratorAdapter } from "../../../src/infra/auth/jwt-token-generator-adapter.js"
import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"
import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"
import { CreatePet } from "../../../src/application/usecase/pet/create-pet.js"
import { PetRepositoryDatabase } from "../../../src/infra/repository/pet/pet-repository.js"
import type {
  PhotoInput,
  PhotoStorage,
} from "../../../src/application/ports/storage/photo-storage.js"
import { Cache } from "../../../src/application/ports/cache/cache.js"
import { UpdatePet } from "../../../src/application/usecase/pet/update-pet.js"
import {
  NotPetOwnerError,
  PetNotFoundError,
} from "../../../src/application/errors/pet/index.js"

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

describe("Update Pet", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter
  let accountRepository: AccountRepositoryDatabase
  let petRepository: PetRepositoryDatabase
  let signup: Signup
  let createPet: CreatePet
  let updatePet: UpdatePet
  let photoStorage: PhotoStorageStub

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
      new JwtTokenGeneratorAdapter(ACCESS_SECRET, REFRESH_SECRET, "15m", "7d")
    )
    photoStorage = new PhotoStorageStub()
    createPet = new CreatePet(petRepository, photoStorage, new InMemoryCache())
    updatePet = new UpdatePet(petRepository, new InMemoryCache(), photoStorage)
  })

  afterEach(async () => {
    await prisma.pet.deleteMany({})
    await prisma.account.deleteMany({})
  })

  test("should update a pet", async () => {
    const account = await signup.execute({
      name: "John Doe",
      email: "FmE0i@example.com",
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "Campina Grande",
      state: "PB",
    })
    const pet = await createPet.execute({
      ownerId: account.userId,
      name: "Spike",
      species: "Dog",
      gender: "MALE",
      age: 3,
      size: "SMALL",
      description: "Cute",
      photo: null,
    })
    const petUpdateInput = await updatePet.execute({
      petId: pet.petId,
      requesterId: account.userId,
      name: "SpikeUpdated",
      age: 5,
    })
    expect(petUpdateInput.name).toBe("SpikeUpdated")
    expect(petUpdateInput.age).toBe(5)
  })

  test("should throw an error if pet not found", async () => {
    const input = {
      petId: "57a08f5a-47f5-491f-bc89-3710216d227a",
      requesterId: "57a08f5a-47f5-491f-bc89-3710216d227a",
      name: "SpikeUpdated",
      age: 5,
    }
    await expect(updatePet.execute(input)).rejects.toThrow(
      new PetNotFoundError()
    )
  })

  test("should throw an error if not pet owner", async () => {
    const ownerOutput = await signup.execute({
      name: "Owner",
      email: `owner-${Date.now()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
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
      description: "Cute",
      photo: null,
    })
    const notOwnerId = "7fa98d15-9b93-415a-a868-b679c3902a99"
    const updateInput = {
      petId: petOutput.petId,
      requesterId: notOwnerId,
      name: "SpikeUpdated",
      age: 5,
    }
    await expect(updatePet.execute(updateInput)).rejects.toThrow(
      new NotPetOwnerError()
    )
  })
})
