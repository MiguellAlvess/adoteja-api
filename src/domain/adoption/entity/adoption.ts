import UUID from "../../account/vo/uuid.js"
import { AdoptionState } from "../state/adoption-state.js"
import { PendingState } from "../state/pending.js"
import { AdoptionStatusName, makeState } from "../state/state-factory.js"

export class Adoption {
  private id: UUID
  private petId: UUID
  private adopterId: UUID
  private state: AdoptionState
  private requestedAt: Date
  private completedAt: Date | null

  private constructor(
    id: string,
    petId: string,
    adopterId: string,
    state: AdoptionState,
    requestedAt: Date,
    completedAt: Date | null
  ) {
    this.id = new UUID(id)
    this.petId = new UUID(petId)
    this.adopterId = new UUID(adopterId)
    this.state = state
    this.requestedAt = requestedAt
    this.completedAt = completedAt
  }

  static request(petId: string, adopterId: string) {
    const id = UUID.create().getValue()
    return new Adoption(
      id,
      petId,
      adopterId,
      new PendingState(),
      new Date(),
      null
    )
  }

  static fromPersistence(props: {
    id: string
    petId: string
    adopterId: string
    status: AdoptionStatusName
    requestedAt: Date
    completedAt: Date | null
  }): Adoption {
    const state = makeState(props.status)
    return new Adoption(
      props.id,
      props.petId,
      props.adopterId,
      state,
      props.requestedAt,
      props.completedAt
    )
  }

  approve(): void {
    this.state.approve(this)
  }
  reject(): void {
    this.state.reject(this)
  }
  complete(): void {
    this.state.complete(this)
  }

  setState(state: AdoptionState): void {
    this.state = state
  }
  setCompletedAt(date: Date): void {
    this.completedAt = date
  }

  getId() {
    return this.id.getValue()
  }
  getPetId() {
    return this.petId.getValue()
  }
  getAdopterId() {
    return this.adopterId.getValue()
  }
  getRequestedAt() {
    return this.requestedAt
  }
  getCompletedAt() {
    return this.completedAt
  }
  getStatusName() {
    return this.state.name
  }
}
