import Account from "../../../src/domain/account/entity/account.js"
import bcrypt from "bcrypt"

describe("Account", () => {
  test("should create a valid account", async () => {
    const passwordHash = await bcrypt.hash("ValidPassword123", 4)

    const account = Account.create(
      "Miguel",
      "test@gmail.com",
      passwordHash,
      "(99) 99999-9999",
      "City",
      "PB"
    )

    expect(account.getName()).toBe("Miguel")
    expect(account.getEmail()).toBe("test@gmail.com")
  })
})
