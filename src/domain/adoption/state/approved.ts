import { Adoption } from "../entity/adoption.js"
import { AdoptionState } from "./adoption-state.js"
import { OnlyPendingCanBeApprovedError } from "../../errors/adoption/adoption-errors.js"
import { CompletedState } from "./completed.js"

export class ApprovedState implements AdoptionState {
  readonly name = "APPROVED"

  approve(_adoption: Adoption): void {
    throw new OnlyPendingCanBeApprovedError()
  }
  reject(_adoption: Adoption): void {
    throw new OnlyPendingCanBeApprovedError()
  }
  complete(adoption: Adoption): void {
    adoption.setCompletedAt(new Date())
    adoption.setState(new CompletedState())
  }
}
