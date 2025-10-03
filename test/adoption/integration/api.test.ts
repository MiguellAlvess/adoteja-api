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

  test("should return 401 when requesting without auth", async () => {
    const output = await axios.post(`${baseURL}/api/adoptions`, {
      petId: "ac355f06-db61-4e5b-8fef-7e6abb6ce47c",
    })
    expect(output.status).toBe(401)
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

  test("should return 400 when body is invalid (invalid UUID)", async () => {
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
})
