import { describe, test, expect, beforeAll, afterEach } from "vitest"
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

describe("CreatePet", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter
  let accountRepository: AccountRepositoryDatabase
  let petRepository: PetRepositoryDatabase
  let signup: Signup
  let createPet: CreatePet
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
    createPet = new CreatePet(petRepository, photoStorage)
  })

  afterEach(async () => {
    await prisma.pet.deleteMany({})
    await prisma.account.deleteMany({})
  })

  test("should create a pet without photo", async () => {
    const owner = await signup.execute({
      name: "Owner",
      email: `owner-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    })
    const input = {
      ownerId: owner.userId,
      name: "Spike",
      species: "Dog",
      gender: "MALE",
      age: 5,
      size: "SMALL",
      description: "Adorable and friendly dog",
      photo: null as PhotoInput | null,
    }
    const output = await createPet.execute(input)
    expect(output.petId).toBeDefined()
    expect(output.ownerId).toBe(owner.userId)
    expect(output.name).toBe(input.name)
    expect(output.species).toBe(input.species)
    expect(output.gender).toBe(input.gender)
    expect(output.age).toBe(input.age)
    expect(output.size).toBe(input.size)
    expect(output.description).toBe(input.description)
    expect(output.photoUrl).toBeNull()
    expect(output.status).toBe("AVAILABLE")
  })

  test("should create a pet with photo (uploads and stores url)", async () => {
    photoStorage = new PhotoStorageStub("http://cdn.local/pets/spike.jpg")
    createPet = new CreatePet(petRepository, photoStorage)
    const owner = await signup.execute({
      name: "Owner Two",
      email: `owner2-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    })
    const fakePhoto: PhotoInput = {
      buffer: Buffer.from("fake-bytes"),
      filename: "spike.jpg",
      mimeType: "image/jpeg",
    }
    const output = await createPet.execute({
      ownerId: owner.userId,
      name: "Spike",
      species: "Dog",
      gender: "MALE",
      age: 3,
      size: "SMALL",
      description: "Cute",
      photo: fakePhoto,
    })
    expect(output.photoUrl).toBe("http://cdn.local/pets/spike.jpg")
    expect(photoStorage.lastUploaded?.filename).toBe("spike.jpg")
    expect(photoStorage.lastUploaded?.mimeType).toBe("image/jpeg")
  })
})
