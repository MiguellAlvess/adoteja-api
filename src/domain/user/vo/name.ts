export default class Name {
  private value: string

  constructor(name: string) {
    if (!this.validateName(name)) throw new Error("Invalid name")
    this.value = name
  }

  validateName(name: string) {
    const n = name?.trim()
    if (!n || n.length > 120) return false
    return /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)*$/.test(n)
  }

  getValue() {
    return this.value
  }
}
