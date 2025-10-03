import { Adoption } from "../../../src/domain/adoption/entity/adoption.js"
import {
  OnlyApprovedCanBeCompletedError,
  OnlyPendingCanBeApprovedError,
  OnlyPendingCanBeRejectedError,
} from "../../../src/domain/errors/adoption/adoption-errors.js"

describe("Adoption ", () => {
  test("should create a new adoption request in PENDING", () => {
    const petId = "5d78ef0b-b435-4cfb-b59f-e096dca04b08"
    const adopterId = "085fffb7-5bcb-48c0-a395-39d19d81b634"
    const adoption = Adoption.request(petId, adopterId)
    expect(adoption.getPetId()).toBe(petId)
    expect(adoption.getAdopterId()).toBe(adopterId)
    expect(adoption.getStatusName()).toBe("PENDING")
    expect(adoption.getRequestedAt()).toBeInstanceOf(Date)
    expect(adoption.getCompletedAt()).toBeNull()
  })

  test("should move from PENDING to APPROVED", () => {
    const adoption = Adoption.request(
      "5d78ef0b-b435-4cfb-b59f-e096dca04b08",
      "085fffb7-5bcb-48c0-a395-39d19d81b634"
    )
    adoption.approve()
    expect(adoption.getStatusName()).toBe("APPROVED")
    expect(adoption.getCompletedAt()).toBeNull()
  })

  test("should move from PENDING to REJECTED", () => {
    const adoption = Adoption.request(
      "5d78ef0b-b435-4cfb-b59f-e096dca04b08",
      "085fffb7-5bcb-48c0-a395-39d19d81b634"
    )
    adoption.reject()
    expect(adoption.getStatusName()).toBe("REJECTED")
    expect(adoption.getCompletedAt()).toBeNull()
  })

  test("should complete from APPROVED and set completedAt", () => {
    const adoption = Adoption.request(
      "5d78ef0b-b435-4cfb-b59f-e096dca04b08",
      "085fffb7-5bcb-48c0-a395-39d19d81b634"
    )
    adoption.approve()
    adoption.complete()
    expect(adoption.getStatusName()).toBe("COMPLETED")
    expect(adoption.getCompletedAt()).toBeInstanceOf(Date)
  })

  test("should not complete from PENDING", () => {
    const adoption = Adoption.request(
      "5d78ef0b-b435-4cfb-b59f-e096dca04b08",
      "085fffb7-5bcb-48c0-a395-39d19d81b634"
    )
    expect(() => adoption.complete()).toThrow(OnlyApprovedCanBeCompletedError)
    expect(adoption.getStatusName()).toBe("PENDING")
  })

  test("should not approve when already APPROVED", () => {
    const adoption = Adoption.request(
      "5d78ef0b-b435-4cfb-b59f-e096dca04b08",
      "085fffb7-5bcb-48c0-a395-39d19d81b634"
    )
    adoption.approve()
    expect(() => adoption.approve()).toThrow(OnlyPendingCanBeApprovedError)
    expect(adoption.getStatusName()).toBe("APPROVED")
  })

  test("should not reject when already APPROVED", () => {
    const adoption = Adoption.request(
      "5d78ef0b-b435-4cfb-b59f-e096dca04b08",
      "085fffb7-5bcb-48c0-a395-39d19d81b634"
    )
    adoption.approve()
    expect(() => adoption.reject()).toThrow(OnlyPendingCanBeApprovedError)
    expect(adoption.getStatusName()).toBe("APPROVED")
  })

  test("should not transition from REJECTED", () => {
    const adoption = Adoption.request(
      "5d78ef0b-b435-4cfb-b59f-e096dca04b08",
      "085fffb7-5bcb-48c0-a395-39d19d81b634"
    )
    adoption.reject()
    expect(() => adoption.approve()).toThrow(OnlyPendingCanBeRejectedError)
    expect(() => adoption.reject()).toThrow(OnlyPendingCanBeRejectedError)
    expect(() => adoption.complete()).toThrow(OnlyApprovedCanBeCompletedError)
    expect(adoption.getStatusName()).toBe("REJECTED")
  })

  test("should not transition from COMPLETED", () => {
    const adoption = Adoption.request(
      "5d78ef0b-b435-4cfb-b59f-e096dca04b08",
      "085fffb7-5bcb-48c0-a395-39d19d81b634"
    )
    adoption.approve()
    adoption.complete()
    expect(() => adoption.approve()).toThrow(OnlyPendingCanBeApprovedError)
    expect(() => adoption.reject()).toThrow(OnlyPendingCanBeRejectedError)
    expect(() => adoption.complete()).toThrow(OnlyApprovedCanBeCompletedError)
    expect(adoption.getStatusName()).toBe("COMPLETED")
  })
})
