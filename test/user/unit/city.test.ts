import { City } from "../../../src/domain/user/vo/city.js"

describe("City", () => {
  test.each([
    "''Campina",
    "Campina-",
    "Campina--Grande",
    "Cidade123",
    "",
    "  ",
  ])("should reject invalid city name '%s'", (city) => {
    expect(() => new City(city)).toThrow("Invalid city name")
  })
  test.each(["Campina Grande", "Xangri-la", "São Paulo"])(
    "should accept valid city name '%s'",
    (inputCity) => {
      const city = new City(inputCity)
      expect(city).toBeInstanceOf(City)
    }
  )
})
