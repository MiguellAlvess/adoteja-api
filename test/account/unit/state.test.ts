import { State } from "../../../src/domain/account/vo/state.js"
import { InvalidStateError } from "../../../src/domain/errors/account/account-errors.js"

describe("State", () => {
  test.each(["state", "Rio de Janeiro", "SP22s"])(
    "should reject invalid state '%s'",
    (state) => {
      expect(() => new State(state)).toThrow(InvalidStateError)
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
