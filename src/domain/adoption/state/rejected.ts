import { Adoption } from "../entity/adoption.js"
import { AdoptionState } from "./adoption-state.js"
import {
  OnlyPendingCanBeRejectedError,
  OnlyApprovedCanBeCompletedError,
} from "../../errors/adoption/adoption-errors.js"

export class RejectedState implements AdoptionState {
  readonly name = "REJECTED"

  approve(_adoption: Adoption): void {
    throw new OnlyPendingCanBeRejectedError()
  }
  reject(_adoption: Adoption): void {
    throw new OnlyPendingCanBeRejectedError()
  }
  complete(_adoption: Adoption): void {
    throw new OnlyApprovedCanBeCompletedError()
  }
}
