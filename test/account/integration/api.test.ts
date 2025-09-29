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

  test("should return 201 when account is created", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "RJ",
    }
    const output = await axios.post(`${baseURL}/api/accounts`, input)
    expect(output.status).toBe(201)
    expect(output.data.accessToken).toBeDefined()
    expect(output.data.refreshToken).toBeDefined()
  })

  test("should return 200 when account is found (GET /me)", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "RJ",
    }
    const signup = await axios.post(`${baseURL}/api/accounts`, input)
    const accessToken = signup.data.accessToken as string

    const outputGet = await axios.get(`${baseURL}/api/accounts/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    expect(outputGet.status).toBe(200)
    expect(outputGet.data.name).toBe(input.name)
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

  test("should return 404 when account is not found (GET /me after delete)", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "RJ",
    }
    const signup = await axios.post(`${baseURL}/api/accounts`, input)
    const accessToken = signup.data.accessToken as string
    const deleteOuput = await axios.delete(`${baseURL}/api/accounts/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    expect(deleteOuput.status).toBe(200)
    const output = await axios.get(`${baseURL}/api/accounts/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
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

  test("should return 200 when account is updated (PATCH /me)", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "RJ",
    }
    const signup = await axios.post(`${baseURL}/api/accounts`, input)
    const accessToken = signup.data.accessToken as string

    const inputUpdate = {
      name: "Robert Martin Updated",
      email: `testupdated${Math.random()}@example.com`,
      password: "UpdatedPassword123",
      phone: "(83) 98888-8888",
    }

    const outputUpdate = await axios.patch(
      `${baseURL}/api/accounts/me`,
      inputUpdate,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    expect(outputUpdate.status).toBe(200)
    expect(outputUpdate.data.name).toBe(inputUpdate.name)
    expect(outputUpdate.data.email).toBe(inputUpdate.email)
    expect(outputUpdate.data.phone).toBe(inputUpdate.phone)
  })

  test("should return 200 when account is deleted (DELETE /me)", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "RJ",
    }
    const signup = await axios.post(`${baseURL}/api/accounts`, input)
    const accessToken = signup.data.accessToken as string
    const outputDelete = await axios.delete(`${baseURL}/api/accounts/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    expect(outputDelete.status).toBe(200)
  })

  test("should return 200 when account is logged", async () => {
    const signupBody = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "RJ",
    }
    await axios.post(`${baseURL}/api/accounts`, signupBody)

    const loginBody = { email: signupBody.email, password: signupBody.password }
    const res = await axios.post(`${baseURL}/api/login`, loginBody)

    expect(res.status).toBe(200)
    expect(res.data.accessToken).toBeDefined()
    expect(res.data.refreshToken).toBeDefined()
  })
})
