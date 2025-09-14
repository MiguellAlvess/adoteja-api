import { State } from "../../../src/domain/user/vo/state.js"

describe("State", () => {
  test.each(["", "   ", "state", "Rio de Janeiro", "SP22"])(
    "should reject invalid state '%s'",
    (state) => {
      expect(() => new State(state)).toThrow("Invalid state")
    }
  )
  test.each(["AC", "RJ", "SP", "PR", "SC", "RS", "MS"])(
    "should accept valid state '%s'",
    (inputState) => {
      const state = new State(inputState)
      expect(state).toBeInstanceOf(State)
    }
  )
})
