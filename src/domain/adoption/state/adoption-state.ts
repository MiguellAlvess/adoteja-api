import { Adoption } from "../entity/adoption.js"

export interface AdoptionState {
  readonly name: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED"
  approve(adoption: Adoption): void
  reject(adoption: Adoption): void
  complete(adoption: Adoption): void
}
