import { AdoptionState } from "./adoption-state.js"
import { PendingState } from "./pending.js"
import { ApprovedState } from "./approved.js"
import { RejectedState } from "./rejected.js"
import { CompletedState } from "./completed.js"

export type AdoptionStatusName =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"

export function makeState(status: AdoptionStatusName): AdoptionState {
  switch (status) {
    case "PENDING":
      return new PendingState()
    case "APPROVED":
      return new ApprovedState()
    case "REJECTED":
      return new RejectedState()
    case "COMPLETED":
      return new CompletedState()
  }
}
