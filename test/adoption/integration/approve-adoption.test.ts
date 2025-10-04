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
import { ApproveAdoption } from "../../../src/application/usecase/adoption/approve-adoption.js"
import type {
  PhotoInput,
  PhotoStorage,
} from "../../../src/application/ports/storage/photo-storage.js"
import { Cache } from "../../../src/application/ports/cache/cache.js"
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

describe("Approve Adoption", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter

  let accountRepository: AccountRepositoryDatabase
  let petRepository: PetRepositoryDatabase
  let adoptionRepository: AdoptionRepositoryDatabase

  let signup: Signup
  let createPet: CreatePet
  let requestAdoption: RequestAdoption
  let approveAdoption: ApproveAdoption

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
    approveAdoption = new ApproveAdoption(adoptionRepository)
  })

  afterEach(async () => {
    await prisma.adoption.deleteMany({})
    await prisma.pet.deleteMany({})
    await prisma.account.deleteMany({})
  })

  test("should approve a pending adoption", async () => {
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
    const output = await approveAdoption.execute(adoptionOutput.adoptionId)
    expect(output.status).toBe("APPROVED")
    expect(output.id).toBe(adoptionOutput.adoptionId)
    const adoptionRow = await prisma.adoption.findUnique({
      where: { id: adoptionOutput.adoptionId },
      select: { status: true },
    })
    expect(adoptionRow?.status).toBe("APPROVED")
  })

  test("should throw AdoptionNotFoundError when adoption does not exist", async () => {
    await expect(
      approveAdoption.execute("ac355f06-db61-4e5b-8fef-7e6abb6ce47c")
    ).rejects.toThrow(new AdoptionNotFoundError())
  })
})
