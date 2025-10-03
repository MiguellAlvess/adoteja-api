import { DomainError } from "../domain-error.js"

export class OnlyPendingCanBeApprovedError extends DomainError {
  constructor() {
    super("Only PENDING can be approved", "ONLY_PENDING_CAN_BE_APPROVED")
  }
}

export class OnlyPendingCanBeRejectedError extends DomainError {
  constructor() {
    super(" Only PENDING can be rejected", "ONLY_PENDING_CAN_BE_REJECTED")
  }
}

export class OnlyApprovedCanBeCompletedError extends DomainError {
  constructor() {
    super("Only APPROVED can be completed", "ONLY_APPROVED_CAN_BE_COMPLETED")
  }
}
