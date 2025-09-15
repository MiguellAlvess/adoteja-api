export class State {
  private readonly value: string

  constructor(state: string) {
    const trimmed = state.trim()
    if (!trimmed) throw new Error("Invalid state")
    const normalizedState = trimmed.toUpperCase()
    if (!this.validateState(normalizedState)) {
      throw new Error("Invalid state")
    }
    this.value = normalizedState
  }

  validateState(state: string): boolean {
    if (!/^[A-Z]{2}$/.test(state)) return false
    const UFS = new Set([
      "AC",
      "AL",
      "AP",
      "AM",
      "BA",
      "CE",
      "DF",
      "ES",
      "GO",
      "MA",
      "MT",
      "MS",
      "MG",
      "PA",
      "PB",
      "PR",
      "PE",
      "PI",
      "RJ",
      "RN",
      "RS",
      "RO",
      "RR",
      "SC",
      "SP",
      "SE",
      "TO",
    ])
    return UFS.has(state)
  }

  getValue() {
    return this.value
  }
}
