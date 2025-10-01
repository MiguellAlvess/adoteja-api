import type { IncomingHttpHeaders } from "http"
import { HttpServer } from "../../http/http-server.js"
import { http } from "../../http/http.js"
import { makeRequireAuth, Authed } from "../../http/require-auth.js"
import { AccessTokenVerifier } from "../../../application/ports/auth/access-token-verifier.js"
import { CreatePet } from "../../../application/usecase/pet/create-pet.js"
import { createPetSchema } from "../../http/schemas/pet-schemas.js"
import type { PhotoInput } from "../../../application/ports/storage/photo-storage.js"

type BodyWithFile = {
  __file?: {
    buffer: Buffer
    originalname: string
    mimetype: string
  }
} & Record<string, unknown>

export class PetController {
  constructor(
    httpServer: HttpServer,
    createPet: CreatePet,
    tokenVerifier: AccessTokenVerifier
  ) {
    const requireAuth = makeRequireAuth(tokenVerifier)

    httpServer.route(
      "post",
      "/api/pets",
      requireAuth<
        Record<string, string>,
        BodyWithFile,
        Record<string, unknown>
      >(
        async (
          _params: Record<string, string>,
          body: BodyWithFile,
          _query: Record<string, unknown>,
          _headers: IncomingHttpHeaders,
          auth: Authed
        ) => {
          const parsed = createPetSchema.parse({
            name: body.name,
            species: body.species,
            gender: body.gender,
            age: body.age,
            size: body.size,
            description: body.description ?? null,
          })
          let photo: PhotoInput | null = null
          if (body.__file) {
            photo = {
              buffer: body.__file.buffer,
              filename: body.__file.originalname,
              mimeType: body.__file.mimetype,
            }
          }
          const output = await createPet.execute({
            ownerId: auth.sub,
            ...parsed,
            photo,
          })
          return http.created(output)
        }
      ),
      { upload: { single: "photo" } }
    )
  }
}
