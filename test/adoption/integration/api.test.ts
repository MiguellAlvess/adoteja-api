import axios from "axios"
import { buildApp } from "../../../src/app.js"
import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { AddressInfo } from "net"

axios.defaults.validateStatus = () => true

describe("Adoption API", () => {
  let baseURL: string
  let stopServer: () => Promise<void>

  beforeAll(async () => {
    const { url } = await startPostgresTestDb()
    process.env.DATABASE_URL = url
    process.env.JWT_ACCESS_TOKEN_SECRET = "test-access"
    process.env.JWT_REFRESH_TOKEN_SECRET = "test-refresh"

    const app = buildApp()
    const server = app.listen(0)
    const addr = server.address() as AddressInfo
    baseURL = `http://127.0.0.1:${addr.port}`
    stopServer = () => new Promise((res) => server.close(() => res()))
  })

  afterAll(async () => {
    await stopServer()
  })

  test("should return 201 when adoption is requested", async () => {
    const ownerInput = {
      name: "Owner",
      email: `owner-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const ownerOutput = await axios.post(`${baseURL}/api/accounts`, ownerInput)
    expect(ownerOutput.status).toBe(201)
    const ownerToken = ownerOutput.data.accessToken
    const adopterInput = {
      name: "Adopter",
      email: `adopter-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const adopterOutput = await axios.post(
      `${baseURL}/api/accounts`,
      adopterInput
    )
    expect(adopterOutput.status).toBe(201)
    const adopterToken = adopterOutput.data.accessToken
    const petInput = {
      name: "Spike",
      species: "Dog",
      gender: "MALE",
      age: 3,
      size: "SMALL",
      description: "Adorable",
    }
    const petOutput = await axios.post(`${baseURL}/api/pets`, petInput, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    })
    expect(petOutput.status).toBe(201)
    const petId = petOutput.data.petId
    const adoptionOutput = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId },
      { headers: { Authorization: `Bearer ${adopterToken}` } }
    )
    expect(adoptionOutput.status).toBe(201)
    expect(adoptionOutput.data.adoptionId).toBeDefined()
    expect(adoptionOutput.data.petId).toBe(petId)
    expect(adoptionOutput.data.status).toBe("PENDING")
    expect(adoptionOutput.data.requestedAt).toBeDefined()
  })

  test("should return 404 when pet does not exist", async () => {
    const adopterInput = {
      name: "Adopter",
      email: `adopter-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const adopterOutput = await axios.post(
      `${baseURL}/api/accounts`,
      adopterInput
    )
    expect(adopterOutput.status).toBe(201)
    const adopterToken = adopterOutput.data.accessToken

    const nonExistentPetId = "ac355f06-db61-4e5b-8fef-7e6abb6ce47c"
    const output = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId: nonExistentPetId },
      { headers: { Authorization: `Bearer ${adopterToken}` } }
    )
    expect(output.status).toBe(404)
  })

  test("should return 409 when pet is not available (ADOPTED)", async () => {
    const ownerInput = {
      name: "Owner",
      email: `owner-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const ownerRes = await axios.post(`${baseURL}/api/accounts`, ownerInput)
    expect(ownerRes.status).toBe(201)
    const ownerToken = ownerRes.data.accessToken
    const petInput = {
      name: "Thor",
      species: "Dog",
      gender: "MALE",
      age: 5,
      size: "LARGE",
      description: "Loyal",
    }
    const petOutput = await axios.post(`${baseURL}/api/pets`, petInput, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    })
    expect(petOutput.status).toBe(201)
    const petId = petOutput.data.petId
    const patchOutput = await axios.patch(
      `${baseURL}/api/pets/${petId}`,
      { status: "ADOPTED" },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    )
    expect(patchOutput.status).toBe(200)
    const adopterInput = {
      name: "Adopter",
      email: `adopter-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const adopterOutput = await axios.post(
      `${baseURL}/api/accounts`,
      adopterInput
    )
    expect(adopterOutput.status).toBe(201)
    const adopterToken = adopterOutput.data.accessToken
    const output = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId },
      { headers: { Authorization: `Bearer ${adopterToken}` } }
    )
    expect(output.status).toBe(409)
  })

  test("should return 409 when there is already an active adoption for this adopter/pet", async () => {
    const ownerInput = {
      name: "Owner",
      email: `owner-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const ownerOutput = await axios.post(`${baseURL}/api/accounts`, ownerInput)
    expect(ownerOutput.status).toBe(201)
    const ownerToken = ownerOutput.data.accessToken
    const petInput = {
      name: "Luna",
      species: "Cat",
      gender: "FEMALE",
      age: 2,
      size: "SMALL",
      description: "Playful",
    }
    const petOuptut = await axios.post(`${baseURL}/api/pets`, petInput, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    })
    expect(petOuptut.status).toBe(201)
    const petId = petOuptut.data.petId
    const adopterInput = {
      name: "Adopter",
      email: `adopter-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const adopterOutput = await axios.post(
      `${baseURL}/api/accounts`,
      adopterInput
    )
    expect(adopterOutput.status).toBe(201)
    const adopterToken = adopterOutput.data.accessToken
    const first = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId },
      { headers: { Authorization: `Bearer ${adopterToken}` } }
    )
    expect(first.status).toBe(201)
    const second = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId },
      { headers: { Authorization: `Bearer ${adopterToken}` } }
    )
    expect(second.status).toBe(409)
  })

  test("should return 400 when body is invalid", async () => {
    const adopterInput = {
      name: "Adopter",
      email: `adopter-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const adopterOutput = await axios.post(
      `${baseURL}/api/accounts`,
      adopterInput
    )
    expect(adopterOutput.status).toBe(201)
    const adopterToken = adopterOutput.data.accessToken
    const output = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId: "invalid-id" },
      { headers: { Authorization: `Bearer ${adopterToken}` } }
    )
    expect(output.status).toBe(400)
  })

  test("should return 200 when adoption is found", async () => {
    const ownerInput = {
      name: "Owner",
      email: `owner-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const ownerOutput = await axios.post(`${baseURL}/api/accounts`, ownerInput)
    expect(ownerOutput.status).toBe(201)
    const ownerToken = ownerOutput.data.accessToken as string
    const adopterInput = {
      name: "Adopter",
      email: `adopter-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const adopterOutput = await axios.post(
      `${baseURL}/api/accounts`,
      adopterInput
    )
    expect(adopterOutput.status).toBe(201)
    const adopterToken = adopterOutput.data.accessToken as string
    const petInput = {
      name: "Spike",
      species: "Dog",
      gender: "MALE",
      age: 3,
      size: "SMALL",
      description: "Adorable",
    }
    const petOutput = await axios.post(`${baseURL}/api/pets`, petInput, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    })
    expect(petOutput.status).toBe(201)
    const petId = petOutput.data.petId as string
    const adoptionCreateOutput = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId },
      { headers: { Authorization: `Bearer ${adopterToken}` } }
    )
    expect(adoptionCreateOutput.status).toBe(201)
    const adoptionId = adoptionCreateOutput.data.adoptionId as string
    const getOutput = await axios.get(
      `${baseURL}/api/adoptions/${adoptionId}`,
      {
        headers: { Authorization: `Bearer ${adopterToken}` },
      }
    )
    expect(getOutput.status).toBe(200)
    expect(getOutput.data.id).toBe(adoptionId)
    expect(getOutput.data.petId).toBe(petId)
  })

  test("should return 200 when adoption is approved", async () => {
    const ownerInput = {
      name: "Owner",
      email: `owner-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const ownerOutput = await axios.post(`${baseURL}/api/accounts`, ownerInput)
    expect(ownerOutput.status).toBe(201)
    const ownerToken = ownerOutput.data.accessToken as string
    const adopterInput = {
      name: "Adopter",
      email: `adopter-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const adopterOutput = await axios.post(
      `${baseURL}/api/accounts`,
      adopterInput
    )
    expect(adopterOutput.status).toBe(201)
    const adopterToken = adopterOutput.data.accessToken as string
    const petInput = {
      name: "Spike",
      species: "Dog",
      gender: "MALE",
      age: 3,
      size: "SMALL",
      description: "Adorable",
    }
    const petOutput = await axios.post(`${baseURL}/api/pets`, petInput, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    })
    expect(petOutput.status).toBe(201)
    const petId = petOutput.data.petId as string
    const adoptionOutput = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId },
      { headers: { Authorization: `Bearer ${adopterToken}` } }
    )
    expect(adoptionOutput.status).toBe(201)
    const adoptionId = adoptionOutput.data.adoptionId as string
    const approveOutput = await axios.patch(
      `${baseURL}/api/adoptions/${adoptionId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    )
    expect(approveOutput.status).toBe(200)
    expect(approveOutput.data.id).toBe(adoptionId)
    expect(approveOutput.data.status).toBe("APPROVED")
  })

  test("should return 404 when adoption does not exist", async () => {
    const userInput = {
      name: "User",
      email: `user-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 90000-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const userOutput = await axios.post(`${baseURL}/api/accounts`, userInput)
    expect(userOutput.status).toBe(201)
    const token = userOutput.data.accessToken as string
    const invalid = "ac355f06-db61-4e5b-8fef-7e6abb6ce47c"
    const output = await axios.patch(
      `${baseURL}/api/adoptions/${invalid}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    expect(output.status).toBe(404)
  })

  test("should return 200 when adoption is rejected", async () => {
    const ownerInput = {
      name: "Owner",
      email: `owner-r-api-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const ownerOutput = await axios.post(`${baseURL}/api/accounts`, ownerInput)
    expect(ownerOutput.status).toBe(201)
    const ownerToken = ownerOutput.data.accessToken
    const adopterInput = {
      name: "Adopter",
      email: `adopter-r-api-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const adopterOutput = await axios.post(
      `${baseURL}/api/accounts`,
      adopterInput
    )
    expect(adopterOutput.status).toBe(201)
    const adopterToken = adopterOutput.data.accessToken
    const petInput = {
      name: "Spike",
      species: "Dog",
      gender: "MALE",
      age: 3,
      size: "SMALL",
      description: "Adorable",
    }
    const petOutput = await axios.post(`${baseURL}/api/pets`, petInput, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    })
    expect(petOutput.status).toBe(201)
    const petId = petOutput.data.petId
    const requestOutput = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId },
      { headers: { Authorization: `Bearer ${adopterToken}` } }
    )
    expect(requestOutput.status).toBe(201)
    const adoptionId = requestOutput.data.adoptionId
    const rejectOutput = await axios.patch(
      `${baseURL}/api/adoptions/${adoptionId}/reject`,
      {},
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    )
    expect(rejectOutput.status).toBe(200)
    expect(rejectOutput.data.status).toBe("REJECTED")
  })

  test("should return 200 when adoption is completed", async () => {
    const ownerInput = {
      name: "Owner",
      email: `owner-comp-api-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const ownerOutput = await axios.post(`${baseURL}/api/accounts`, ownerInput)
    const ownerToken = ownerOutput.data.accessToken
    const adopterInput = {
      name: "Adopter",
      email: `adopter-comp-api-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const adopterOutput = await axios.post(
      `${baseURL}/api/accounts`,
      adopterInput
    )
    const adopterToken = adopterOutput.data.accessToken
    const petInput = {
      name: "Spike",
      species: "Dog",
      gender: "MALE",
      age: 3,
      size: "SMALL",
      description: "Adorable",
    }
    const petOutput = await axios.post(`${baseURL}/api/pets`, petInput, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    })
    const petId = petOutput.data.petId
    const requestOutput = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId },
      { headers: { Authorization: `Bearer ${adopterToken}` } }
    )
    const adoptionId = requestOutput.data.adoptionId

    const approveOutput = await axios.patch(
      `${baseURL}/api/adoptions/${adoptionId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    )
    expect(approveOutput.status).toBe(200)
    expect(approveOutput.data.status).toBe("APPROVED")

    const completeOutput = await axios.patch(
      `${baseURL}/api/adoptions/${adoptionId}/complete`,
      {},
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    )
    expect(completeOutput.status).toBe(200)
    expect(completeOutput.data.status).toBe("COMPLETED")
    expect(completeOutput.data.completedAt).toBeDefined()
  })

  test("should return 200 with all adoptions of a pet", async () => {
    const ownerInput = {
      name: "Owner",
      email: `owner-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const ownerOutput = await axios.post(`${baseURL}/api/accounts`, ownerInput)
    expect(ownerOutput.status).toBe(201)
    const ownerToken = ownerOutput.data.accessToken as string
    const adopter1Output = await axios.post(`${baseURL}/api/accounts`, {
      name: "AdopterOne",
      email: `ad1-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    })
    const adopter2Output = await axios.post(`${baseURL}/api/accounts`, {
      name: "AdopterTwo",
      email: `ad2-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 97777-0000",
      city: "Campina Grande",
      state: "PB",
    })
    expect(adopter1Output.status).toBe(201)
    expect(adopter2Output.status).toBe(201)
    const adopter1Token = adopter1Output.data.accessToken as string
    const adopter2Token = adopter2Output.data.accessToken as string
    const petOutput = await axios.post(
      `${baseURL}/api/pets`,
      {
        name: "Spike",
        species: "Dog",
        gender: "MALE",
        age: 3,
        size: "SMALL",
        description: "Adorable",
      },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    )
    expect(petOutput.status).toBe(201)
    const petId = petOutput.data.petId as string

    const adoption1 = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId },
      { headers: { Authorization: `Bearer ${adopter1Token}` } }
    )
    const adoption2 = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId },
      { headers: { Authorization: `Bearer ${adopter2Token}` } }
    )
    expect(adoption1.status).toBe(201)
    expect(adoption2.status).toBe(201)
    const listOutput = await axios.get(
      `${baseURL}/api/pets/${petId}/adoptions`,
      {
        headers: { Authorization: `Bearer ${ownerToken}` },
      }
    )
    expect(listOutput.status).toBe(200)
    expect(listOutput.data.length).toBe(2)
  })

  test("should return 200 with all adoptions of an adopter", async () => {
    const ownerRes = await axios.post(`${baseURL}/api/accounts`, {
      name: "Owner",
      email: `owner-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    })
    expect(ownerRes.status).toBe(201)
    const ownerToken = ownerRes.data.accessToken
    const adopterRes = await axios.post(`${baseURL}/api/accounts`, {
      name: "Adopter",
      email: `adopter-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 98888-0000",
      city: "Campina Grande",
      state: "PB",
    })
    expect(adopterRes.status).toBe(201)
    const adopterToken = adopterRes.data.accessToken
    const pet1 = await axios.post(
      `${baseURL}/api/pets`,
      {
        name: "Bolt",
        species: "Dog",
        gender: "MALE",
        age: 4,
        size: "MEDIUM",
        description: "Fast",
      },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    )
    expect(pet1.status).toBe(201)
    const pet2 = await axios.post(
      `${baseURL}/api/pets`,
      {
        name: "Luna",
        species: "Cat",
        gender: "FEMALE",
        age: 2,
        size: "SMALL",
        description: "Playful",
      },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    )
    expect(pet2.status).toBe(201)
    const adoption1 = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId: pet1.data.petId },
      {
        headers: { Authorization: `Bearer ${adopterToken}` },
      }
    )
    expect(adoption1.status).toBe(201)
    const adoption2 = await axios.post(
      `${baseURL}/api/adoptions`,
      { petId: pet2.data.petId },
      {
        headers: { Authorization: `Bearer ${adopterToken}` },
      }
    )
    expect(adoption2.status).toBe(201)
    const listOutput = await axios.get(`${baseURL}/api/adoptions/me`, {
      headers: { Authorization: `Bearer ${adopterToken}` },
    })
    expect(listOutput.status).toBe(200)
    expect(Array.isArray(listOutput.data)).toBe(true)
    expect(listOutput.data.length).toBe(2)
  })
})
