import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { PrismaAdapter } from "../../../src/infra/database/prisma-adapter.js"

import { AccountRepositoryDatabase } from "../../../src/infra/repository/account/account-repository.js"
import { PetRepositoryDatabase } from "../../../src/infra/repository/pet/pet-repository.js"
import { AdoptionRepositoryDatabase } from "../../../src/infra/repository/adoption/adoption-repository.js"

import Account from "../../../src/domain/account/entity/account.js"
import Pet from "../../../src/domain/pet/entity/pet.js"
import { Adoption } from "../../../src/domain/adoption/entity/adoption.js"

import { BcryptAdapter } from "../../../src/infra/crypto/bcrypt-adapter.js"

describe("Adoption Repository", () => {
  let prisma: import("@prisma/client").PrismaClient
  let db: PrismaAdapter

  let accountRepository: AccountRepositoryDatabase
  let petRepository: PetRepositoryDatabase
  let adoptionRepository: AdoptionRepositoryDatabase

  beforeAll(async () => {
    const ctx = await startPostgresTestDb()
    prisma = ctx.prisma
    process.env.DATABASE_URL = ctx.url

    db = new PrismaAdapter()
    accountRepository = new AccountRepositoryDatabase(db)
    petRepository = new PetRepositoryDatabase(db)
    adoptionRepository = new AdoptionRepositoryDatabase(db)
  })

  afterEach(async () => {
    await prisma.adoption.deleteMany({})
    await prisma.pet.deleteMany({})
    await prisma.account.deleteMany({})
  })

  test("should persist a PENDING adoption in the database", async () => {
    const bcrypt = new BcryptAdapter()
    const owner = Account.create(
      "Owner One",
      `owner1-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 99999-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(owner)
    const adopter = Account.create(
      "Adopter One",
      `adopter1-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 98888-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(adopter)
    const pet = Pet.create(
      owner.getAccountId(),
      "Bolt",
      "Dog",
      "MALE",
      4,
      "MEDIUM",
      "Fast runner",
      "http://cdn.local/pets/bolt.jpg"
    )
    await petRepository.add(pet)
    const adoption = Adoption.request(pet.getId(), adopter.getAccountId())
    await adoptionRepository.add(adoption)
    const adoptionRow = await prisma.adoption.findUnique({
      where: { id: adoption.getId() },
      select: { petId: true, adopterId: true, status: true },
    })
    expect(adoptionRow).toBeTruthy()
    expect(adoptionRow?.petId).toBe(pet.getId())
    expect(adoptionRow?.adopterId).toBe(adopter.getAccountId())
    expect(adoptionRow?.status).toBe("PENDING")
  })

  test("should return null on findActiveByAdopterAndPet() when there is no active adoption", async () => {
    const result = await adoptionRepository.findActiveByAdopterAndPet(
      "ac355f06-db61-4e5b-8fef-7e6abb6ce47c",
      "ac355f06-db61-4e5b-8fef-7e6abb6ce47c"
    )
    expect(result).toBeNull()
  })

  test("should return a domain Adoption entity when active adoption is PENDING", async () => {
    const bcrypt = new BcryptAdapter()
    const owner = Account.create(
      "Owner Two",
      `owner2-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 97777-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(owner)
    const adopter = Account.create(
      "Adopter Two",
      `adopter2-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 96666-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(adopter)
    const pet = Pet.create(
      owner.getAccountId(),
      "Luna",
      "Cat",
      "FEMALE",
      2,
      "SMALL",
      "Playful",
      null
    )
    await petRepository.add(pet)
    const adoption = Adoption.request(pet.getId(), adopter.getAccountId())
    await adoptionRepository.add(adoption)
    const output = await adoptionRepository.findActiveByAdopterAndPet(
      adopter.getAccountId(),
      pet.getId()
    )
    expect(output).toBeTruthy()
    expect(output?.getPetId()).toBe(pet.getId())
    expect(output?.getAdopterId()).toBe(adopter.getAccountId())
    expect(output?.getStatusName()).toBe("PENDING")
  })

  test("should return a domain Adoption entity when active adoption is APPROVED", async () => {
    const bcrypt = new BcryptAdapter()
    const owner = Account.create(
      "Owner Three",
      `owner3-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 95555-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(owner)
    const adopter = Account.create(
      "Adopter Three",
      `adopter3-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 94444-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(adopter)
    const pet = Pet.create(
      owner.getAccountId(),
      "Thor",
      "Dog",
      "MALE",
      5,
      "LARGE",
      "Loyal",
      null
    )
    await petRepository.add(pet)
    const row = await prisma.adoption.create({
      data: {
        petId: pet.getId(),
        adopterId: adopter.getAccountId(),
        status: "APPROVED",
      },
      select: { id: true },
    })
    expect(row.id).toBeTruthy()
    const output = await adoptionRepository.findActiveByAdopterAndPet(
      adopter.getAccountId(),
      pet.getId()
    )
    expect(output).toBeTruthy()
    expect(output?.getPetId()).toBe(pet.getId())
    expect(output?.getAdopterId()).toBe(adopter.getAccountId())
    expect(output?.getStatusName()).toBe("APPROVED")
  })

  test("should ignore REJECTED and COMPLETED on findActiveByAdopterAndPet()", async () => {
    const bcrypt = new BcryptAdapter()
    const owner = Account.create(
      "Owner Four",
      `owner4-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 93333-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(owner)
    const adopter = Account.create(
      "Adopter Four",
      `adopter4-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 92222-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(adopter)
    const pet = Pet.create(
      owner.getAccountId(),
      "Spike",
      "Dog",
      "MALE",
      3,
      "SMALL",
      "Cute",
      null
    )
    await petRepository.add(pet)
    await prisma.adoption.create({
      data: {
        petId: pet.getId(),
        adopterId: adopter.getAccountId(),
        status: "REJECTED",
      },
    })
    await prisma.adoption.create({
      data: {
        petId: pet.getId(),
        adopterId: adopter.getAccountId(),
        status: "COMPLETED",
        completedAt: new Date(),
      },
    })
    const output = await adoptionRepository.findActiveByAdopterAndPet(
      adopter.getAccountId(),
      pet.getId()
    )
    expect(output).toBeNull()
  })

  test("should return null on findById() when adoption does not exist", async () => {
    const output = await adoptionRepository.findById(
      "d7577128-eb5d-4763-bb1a-c444aca3f155"
    )
    expect(output).toBeNull()
  })

  test("should return a domain Adoption entity with findById() when status is PENDING", async () => {
    const bcrypt = new BcryptAdapter()
    const ownerInput = Account.create(
      "Owner Five",
      `owner5-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 91111-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(ownerInput)
    const adopterInput = Account.create(
      "Adopter Five",
      `adopter5-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 92222-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(adopterInput)
    const petInput = Pet.create(
      ownerInput.getAccountId(),
      "Rex",
      "Dog",
      "MALE",
      2,
      "SMALL",
      "Friendly",
      null
    )
    await petRepository.add(petInput)
    const adoptionInput = Adoption.request(
      petInput.getId(),
      adopterInput.getAccountId()
    )
    await adoptionRepository.add(adoptionInput)
    const output = await adoptionRepository.findById(adoptionInput.getId())
    expect(output).toBeTruthy()
    expect(output?.getId()).toBe(adoptionInput.getId())
    expect(output?.getPetId()).toBe(petInput.getId())
    expect(output?.getAdopterId()).toBe(adopterInput.getAccountId())
    expect(output?.getStatusName()).toBe("PENDING")
    expect(output?.getCompletedAt()).toBeNull()
  })

  test("should return a domain Adoption entity with findById() when status is APPROVED", async () => {
    const bcrypt = new BcryptAdapter()
    const ownerInput = Account.create(
      "Owner Six",
      `owner6-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 93333-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(ownerInput)
    const adopterInput = Account.create(
      "Adopter Six",
      `adopter6-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 94444-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(adopterInput)
    const petInput = Pet.create(
      ownerInput.getAccountId(),
      "Mia",
      "Cat",
      "FEMALE",
      3,
      "SMALL",
      "Calm",
      null
    )
    await petRepository.add(petInput)
    const row = await prisma.adoption.create({
      data: {
        petId: petInput.getId(),
        adopterId: adopterInput.getAccountId(),
        status: "APPROVED",
      },
      select: { id: true },
    })
    const output = await adoptionRepository.findById(row.id)
    expect(output).toBeTruthy()
    expect(output?.getId()).toBe(row.id)
    expect(output?.getPetId()).toBe(petInput.getId())
    expect(output?.getAdopterId()).toBe(adopterInput.getAccountId())
    expect(output?.getStatusName()).toBe("APPROVED")
  })

  test("should update adoption status to APPROVED in database", async () => {
    const bcrypt = new BcryptAdapter()
    const owner = Account.create(
      "Owner Repo",
      `owner-appr-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 91111-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(owner)
    const adopter = Account.create(
      "Adopter Repo",
      `adopter-appr-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 92222-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(adopter)
    const pet = Pet.create(
      owner.getAccountId(),
      "ApproveDog",
      "Dog",
      "MALE",
      3,
      "SMALL",
      "Cute",
      null
    )
    await petRepository.add(pet)
    const adoption = Adoption.request(pet.getId(), adopter.getAccountId())
    await adoptionRepository.add(adoption)
    adoption.approve()
    await adoptionRepository.update(adoption)
    const adoptionRow = await prisma.adoption.findUnique({
      where: { id: adoption.getId() },
      select: { status: true },
    })
    expect(adoptionRow?.status).toBe("APPROVED")
  })
})
