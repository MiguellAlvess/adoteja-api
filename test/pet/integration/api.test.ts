import axios from "axios"
import { buildApp } from "../../../src/app.js"
import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { AddressInfo } from "net"

axios.defaults.validateStatus = () => true

describe("Pet API", () => {
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

  test("should return 201 when pet is created", async () => {
    const ownerInput = {
      name: "Owner",
      email: `owner-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const outputOwner = await axios.post(`${baseURL}/api/accounts`, ownerInput)
    expect(outputOwner.status).toBe(201)
    const accessToken = outputOwner.data.accessToken as string
    const petInput = {
      name: "Spike",
      species: "Dog",
      gender: "MALE",
      age: 3,
      size: "SMALL",
      description: "Adorable",
    }
    const ouputPet = await axios.post(`${baseURL}/api/pets`, petInput, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    expect(ouputPet.status).toBe(201)
    expect(ouputPet.data.petId).toBeDefined()
  })

  test("should return 400 when gender is invalid", async () => {
    const ownerInput = {
      name: "Owner",
      email: `owner-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const outputOwner = await axios.post(`${baseURL}/api/accounts`, ownerInput)
    expect(outputOwner.status).toBe(201)
    const accessToken = outputOwner.data.accessToken as string
    const petInput = {
      name: "Spike",
      species: "Dog",
      gender: "other",
      age: 3,
      size: "SMALL",
      description: "Adorable",
    }
    const outputPet = await axios.post(`${baseURL}/api/pets`, petInput, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    expect(outputPet.status).toBe(400)
  })

  test("should return 400 when size is invalid", async () => {
    const ownerInput = {
      name: "Owner",
      email: `owner-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const outputOwner = await axios.post(`${baseURL}/api/accounts`, ownerInput)
    expect(outputOwner.status).toBe(201)
    const accessToken = outputOwner.data.accessToken as string
    const petInput = {
      name: "Spike",
      species: "Dog",
      gender: "other",
      age: 3,
      size: "invalid",
      description: "Adorable",
    }
    const outputPet = await axios.post(`${baseURL}/api/pets`, petInput, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    expect(outputPet.status).toBe(400)
  })

  test("should return 400 when description is invalid", async () => {
    const ownerInput = {
      name: "Owner",
      email: `owner-${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(83) 99999-0000",
      city: "Campina Grande",
      state: "PB",
    }
    const outputOwner = await axios.post(`${baseURL}/api/accounts`, ownerInput)
    expect(outputOwner.status).toBe(201)
    const accessToken = outputOwner.data.accessToken as string
    const petInput = {
      name: "Spike",
      species: "Dog",
      gender: "other",
      age: 3,
      size: "invalid",
      description: "a".repeat(501),
    }
    const outputPet = await axios.post(`${baseURL}/api/pets`, petInput, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    expect(outputPet.status).toBe(400)
  })
})
