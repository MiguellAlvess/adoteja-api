import { InvalidPhotoUrlError } from "../../../src/domain/errors/pet/pet-errors.js"
import PhotoUrl from "../../../src/domain/pet/vo/photo-url.js"

describe("PhotoUrl", () => {
  test.each([
    undefined,
    null,
    "",
    "http://example.com/pet.jpg",
    "https://cdn.site/img.png",
  ])("should accept valid photo url: %s", (u) => {
    const url = new PhotoUrl(u)
    if (u == null || u === "") expect(url.getValue()).toBeNull()
    else expect(url.getValue()).toBe(u)
  })

  test.each(["ftp://example.com/img.png", "://bad", "not-an-url"])(
    "should reject invalid photo url '%s'",
    (u) => {
      expect(() => new PhotoUrl(u as string)).toThrow(InvalidPhotoUrlError)
    }
  )
})
