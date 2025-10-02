import type { IncomingHttpHeaders } from "http"
import { HttpServer } from "../../http/http-server.js"
import { http } from "../../http/http.js"
import { makeRequireAuth, Authed } from "../../http/require-auth.js"
import { AccessTokenVerifier } from "../../../application/ports/auth/access-token-verifier.js"
import { CreatePet } from "../../../application/usecase/pet/create-pet.js"
import { GetPet } from "../../../application/usecase/pet/get-pet.js"
import { createPetSchema, petIdSchema } from "../../http/schemas/pet-schemas.js"
import type { PhotoInput } from "../../../application/ports/storage/photo-storage.js"
import { GetAllPets } from "../../../application/usecase/pet/get-all.js"

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
    tokenVerifier: AccessTokenVerifier,
    getPet: GetPet,
    getAllPets: GetAllPets
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

    httpServer.route("get", "/api/pets/:id", async (params: { id: string }) => {
      const { id } = petIdSchema.parse(params)
      const output = await getPet.execute(id)
      return http.ok(output)
    })

    httpServer.route("get", "/api/pets", async () => {
      const output = await getAllPets.execute()
      return http.ok(output)
    })
  }
}
