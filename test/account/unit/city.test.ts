import { City } from "../../../src/domain/account/vo/city.js"
import { InvalidCityError } from "../../../src/domain/errors/account/account-errors.js"

describe("City", () => {
  test.each([
    "''Campina",
    "Campina-",
    "Campina--Grande",
    "Cidade123",
    "",
    "  ",
  ])("should reject invalid city name '%s'", (city) => {
    expect(() => new City(city)).toThrow(InvalidCityError)
  })
  test.each(["Campina Grande", "Xangri-la", "São Paulo"])(
    "should accept valid city name '%s'",
    (inputCity) => {
      const city = new City(inputCity)
      expect(city).toBeInstanceOf(City)
    }
  )
})
