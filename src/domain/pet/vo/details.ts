import Description from "./description.js"
import PhotoUrl from "./photo-url.js"

export class PetDetails {
  constructor(
    private readonly description?: Description,
    private readonly photoUrl?: PhotoUrl
  ) {}

  static create(description?: string | null, photoUrl?: string | null) {
    return new PetDetails(
      description !== undefined
        ? new Description(description ?? null)
        : undefined,
      photoUrl !== undefined ? new PhotoUrl(photoUrl ?? null) : undefined
    )
  }

  getDescription() {
    return this.description?.getValue() ?? null
  }
  getPhotoUrl() {
    return this.photoUrl?.getValue() ?? null
  }
}

export default PetDetails
