import { InvalidPhotoUrlError } from "../../errors/pet/pet-errors.js"

export default class PhotoUrl {
  private value: string | null

  constructor(url?: string | null) {
    if (!this.validatePhotoUrl(url)) throw new InvalidPhotoUrlError()
    const u = url?.trim()
    this.value = u ? u : null
  }

  validatePhotoUrl(url?: string | null): boolean {
    if (url == null || url === "") return true
    try {
      const u = new URL(url)
      return u.protocol === "http:" || u.protocol === "https:"
    } catch {
      return false
    }
  }

  getValue(): string | null {
    return this.value
  }
}
