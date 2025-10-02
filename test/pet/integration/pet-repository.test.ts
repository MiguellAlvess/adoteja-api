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
    const petRow = await prisma.pet.findUnique({ where: { id: pet.getId() } })
    expect(petRow).toBeTruthy()
    expect(petRow?.ownerId).toBe(owner.getAccountId())
    expect(petRow?.name).toBe("Luna")
    expect(petRow?.species).toBe("Cat")
    expect(petRow?.gender).toBe("FEMALE")
    expect(petRow?.age).toBe(2)
    expect(petRow?.size).toBe("SMALL")
    expect(petRow?.description).toBe("Playful kitten")
    expect(petRow?.photoUrl).toBe("http://cdn.local/pets/luna.jpg")
    expect(petRow?.status).toBe("AVAILABLE")
  })

  test("should return a Pet domain entity with findById()", async () => {
    const bcrypt = new BcryptAdapter()
    const ownerInput = Account.create(
      "Owner Three",
      `owner3-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 97777-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(ownerInput)
    const pet = Pet.create(
      ownerInput.getAccountId(),
      "Thor",
      "Dog",
      "MALE",
      4,
      "MEDIUM",
      "Loyal friend",
      "http://cdn.local/pets/thor.jpg"
    )
    await petRepository.add(pet)
    const ouput = await petRepository.findById(pet.getId())
    expect(ouput).toBeTruthy()
    expect(ouput?.getId()).toBe(pet.getId())
    expect(ouput?.getOwnerId()).toBe(ownerInput.getAccountId())
    expect(ouput?.getName()).toBe("Thor")
    expect(ouput?.getSpecies()).toBe("Dog")
    expect(ouput?.getGender()).toBe("MALE")
    expect(ouput?.getAge()).toBe(4)
    expect(ouput?.getSize()).toBe("MEDIUM")
    expect(ouput?.getDescription()).toBe("Loyal friend")
    expect(ouput?.getPhotoUrl()).toBe("http://cdn.local/pets/thor.jpg")
    expect(ouput?.getStatus()).toBe("AVAILABLE")
  })

  test("should return null on findById() when pet does not exist", async () => {
    const result = await petRepository.findById(
      "00000000-0000-0000-0000-000000000000"
    )
    expect(result).toBeNull()
  })
  test("should return domain entities for all persisted pets", async () => {
    const bcrypt = new BcryptAdapter()
    const owner = Account.create(
      "Owner Repo",
      `owner-repo-${Math.random()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 90000-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(owner)
    const pet1 = Pet.create(
      owner.getAccountId(),
      "Spike",
      "Dog",
      "MALE",
      3,
      "SMALL",
      "Cute",
      null
    )
    const pet2 = Pet.create(
      owner.getAccountId(),
      "Luna",
      "Cat",
      "FEMALE",
      2,
      "SMALL",
      "Playful",
      "http://cdn.local/pets/luna.jpg"
    )
    await petRepository.add(pet1)
    await petRepository.add(pet2)
    const output = await petRepository.findAll()
    expect(output.length).toBe(2)
  })

  test("should delete a pet from the database", async () => {
    const bcrypt = new BcryptAdapter()
    const ownerInput = Account.create(
      "Owner Delete",
      `owner-del-${Date.now()}@example.com`,
      await bcrypt.hash("ValidPassword123"),
      "(83) 95555-0000",
      "Campina Grande",
      "PB"
    )
    await accountRepository.add(ownerInput)
    const petInput = Pet.create(
      ownerInput.getAccountId(),
      "Bolt",
      "Dog",
      "MALE",
      6,
      "MEDIUM",
      "Fast runner",
      "http://cdn.local/pets/bolt.jpg"
    )
    await petRepository.add(petInput)
    const beforeOutput = await prisma.pet.findUnique({
      where: { id: petInput.getId() },
    })
    expect(beforeOutput).toBeTruthy()
    await petRepository.delete(petInput.getId())
    const afterOutput = await prisma.pet.findUnique({
      where: { id: petInput.getId() },
    })
    expect(afterOutput).toBeNull()
    const pet = await petRepository.findById(petInput.getId())
    expect(pet).toBeNull()
  })
})
