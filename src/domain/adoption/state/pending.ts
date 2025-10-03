import { Adoption } from "../entity/adoption.js"
import { AdoptionState } from "./adoption-state.js"

import { RejectedState } from "./rejected.js"
import { OnlyApprovedCanBeCompletedError } from "../../errors/adoption/adoption-errors.js"
import { ApprovedState } from "./approved.js"

export class PendingState implements AdoptionState {
  readonly name = "PENDING"

  approve(adoption: Adoption): void {
    adoption.setState(new ApprovedState())
  }
  reject(adoption: Adoption): void {
    adoption.setState(new RejectedState())
  }
  complete(_adoption: Adoption): void {
    throw new OnlyApprovedCanBeCompletedError()
  }
}
