import axios from "axios"
import { buildApp } from "../../../src/app.js"
import { startPostgresTestDb } from "../../../src/infra/database/test-db.js"
import { AddressInfo } from "net"

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

  test("/POST /api/accounts should return 201 when account is created", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "RJ",
    }
    const res = await axios.post(`${baseURL}/api/accounts`, input)
    expect(res.status).toBe(201)
  })
})
