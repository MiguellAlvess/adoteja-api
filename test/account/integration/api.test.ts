import axios from "axios"
import { buildApp } from "../../../src/app.js"
import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { AddressInfo } from "net"

axios.defaults.validateStatus = () => true

describe("API", () => {
  let baseURL: string
  let stopServer: () => Promise<void>

  beforeAll(async () => {
    const { url } = await startPostgresTestDb()
    process.env.DATABASE_URL = url
    process.env.ACCESS_SECRET = "test-access"
    process.env.REFRESH_SECRET = "test-refresh"

    const app = buildApp()
    const server = app.listen(0)
    const addr = server.address() as AddressInfo
    baseURL = `http://127.0.0.1:${addr.port}`

    stopServer = () => new Promise((res) => server.close(() => res()))
  })

  afterAll(async () => {
    await stopServer()
  })

  test("should return 201 when account is created", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "RJ",
    }
    const ouput = await axios.post(`${baseURL}/api/accounts`, input)
    expect(ouput.status).toBe(201)
  })

  test("should return 200 when account is found", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "RJ",
    }
    const ouputSignup = await axios.post(`${baseURL}/api/accounts`, input)
    const outputGetAccount = await axios.get(
      `${baseURL}/api/accounts/${ouputSignup.data.userId}`
    )
    expect(outputGetAccount.status).toBe(200)
    expect(outputGetAccount.data.name).toBe(input.name)
  })

  test("should return 409 when email already exists", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "RJ",
    }
    await axios.post(`${baseURL}/api/accounts`, input)
    const output = await axios.post(`${baseURL}/api/accounts`, input)
    expect(output.status).toBe(409)
  })

  test("should return 404 when account is not found", async () => {
    const output = await axios.get(
      `${baseURL}/api/accounts/0b735c5a-2f00-41b7-ad12-b97ac9a7cdba`
    )
    expect(output.status).toBe(404)
  })

  test("should return 400 when email is invalid", async () => {
    const input = {
      name: "Robert Martin",
      email: "test",
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "RJ",
    }
    const output = await axios.post(`${baseURL}/api/accounts`, input)
    expect(output.status).toBe(400)
  })

  test("should return 400 when password is invalid", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "RJ",
    }
    const output = await axios.post(`${baseURL}/api/accounts`, input)
    expect(output.status).toBe(400)
  })

  test("should return 400 when phone is invalid", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "998832",
      city: "City",
      state: "RJ",
    }
    const output = await axios.post(`${baseURL}/api/accounts`, input)
    expect(output.status).toBe(400)
  })

  test("should return 400 when state is invalid", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "XX",
    }
    const output = await axios.post(`${baseURL}/api/accounts`, input)
    expect(output.status).toBe(400)
  })

  test("should return 400 when city is invalid", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "",
      state: "RJ",
    }
    const output = await axios.post(`${baseURL}/api/accounts`, input)
    expect(output.status).toBe(400)
  })

  test("should return 200 when account is updated", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "RJ",
    }
    const ouputSignup = await axios.post(`${baseURL}/api/accounts`, input)
    const inputUpdate = {
      name: "Robert Martin Updated",
      email: `testupdated${Math.random()}@example.com`,
      password: "UpdatedPassword123",
      phone: "(83) 98888-8888",
    }
    const outputUpdate = await axios.patch(
      `${baseURL}/api/accounts/${ouputSignup.data.userId}`,
      inputUpdate
    )
    expect(outputUpdate.status).toBe(200)
    expect(outputUpdate.data.name).toBe(inputUpdate.name)
    expect(outputUpdate.data.email).toBe(inputUpdate.email)
    expect(outputUpdate.data.phone).toBe(inputUpdate.phone)
  })
})
