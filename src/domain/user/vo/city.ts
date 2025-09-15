export class City {
  private value: string

  constructor(city: string) {
    const v = city.trim()
    if (!this.validateCity(v)) throw new Error("Invalid city name")
    this.value = v!
  }

  validateCity(city?: string) {
    if (!city) return false
    if (city.length > 120) return false
    if (!/^[\p{L}\s'.-]+$/u.test(city)) return false
    if (!/^\p{L}.*\p{L}$/u.test(city)) return false
    if (/\p{N}/u.test(city)) return false
    if (/\s{2,}|--|''|\.\./.test(city)) return false
    return true
  }

  getValue() {
    return this.value
  }
}
