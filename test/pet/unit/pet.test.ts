import Pet from "../../../src/domain/pet/entity/pet.js"

describe("Pet", () => {
  test("should create a valid pet", () => {
    const ownerId = "ecb1772c-f2ac-46b0-bd6d-f4f505899714"
    const pet = Pet.create(
      ownerId,
      "Spike",
      "Dog",
      "MALE",
      5,
      "SMALL",
      "Adorable and friendly dog",
      "https://example.com/pet.jpg"
    )

    expect(pet.getName()).toBe("Spike")
    expect(pet.getAge()).toBe(5)
    expect(pet.getPhotoUrl()).toBe("https://example.com/pet.jpg")
  })
})
