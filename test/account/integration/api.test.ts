import axios from "axios"

describe("API", () => {
  test("should create a new account", async () => {
    const input = {
      name: "Robert Martin",
      email: `test${Math.random()}@example.com`,
      password: "ValidPassword123",
      phone: "(99) 99999-9999",
      city: "City",
      state: "PB",
    }
    const responseSignup = await axios.post(
      "http://localhost:8080/api/accounts",
      input
    )
    const outputSignup = responseSignup.data
    const responseGetAccount = await axios.get(
      `http://localhost:8080/api/accounts/${outputSignup.userId}`
    )
    const outputGetAccount = responseGetAccount.data
    expect(outputSignup.userId).toBeDefined()
    expect(outputSignup.accessToken).toBeDefined()
    expect(outputSignup.refreshToken).toBeDefined()
    expect(outputGetAccount.name).toBe(input.name)
    expect(outputGetAccount.email).toBe(input.email)
    expect(outputGetAccount.phone).toBe(input.phone)
    expect(outputGetAccount.city).toBe(input.city)
  })
})
