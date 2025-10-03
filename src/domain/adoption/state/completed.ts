import { Adoption } from "../entity/adoption.js"
import { AdoptionState } from "./adoption-state.js"
import {
  OnlyPendingCanBeApprovedError,
  OnlyPendingCanBeRejectedError,
  OnlyApprovedCanBeCompletedError,
} from "../../errors/adoption/adoption-errors.js"

export class CompletedState implements AdoptionState {
  readonly name = "COMPLETED"

  approve(_adoption: Adoption): void {
    throw new OnlyPendingCanBeApprovedError()
  }
  reject(_adoption: Adoption): void {
    throw new OnlyPendingCanBeRejectedError()
  }
  complete(_adoption: Adoption): void {
    throw new OnlyApprovedCanBeCompletedError()
  }
}
