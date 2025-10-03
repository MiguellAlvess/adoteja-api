import type { IncomingHttpHeaders } from "http"
import { HttpServer } from "../../http/http-server.js"
import { http } from "../../http/http.js"
import { makeRequireAuth, Authed } from "../../http/require-auth.js"
import { AccessTokenVerifier } from "../../../application/ports/auth/access-token-verifier.js"
import { CreatePet } from "../../../application/usecase/pet/create-pet.js"
import { GetPet } from "../../../application/usecase/pet/get-pet.js"
import {
  createPetSchema,
  petIdSchema,
  updatePetSchema,
} from "../../http/schemas/pet-schemas.js"
import type { PhotoInput } from "../../../application/ports/storage/photo-storage.js"
import { GetAllPets } from "../../../application/usecase/pet/get-all.js"
import { DeletePet } from "../../../application/usecase/pet/delete-pet.js"
import { UpdatePet } from "../../../application/usecase/pet/update-pet.js"

type BodyWithFile = {
  __file?: {
    buffer: Buffer
    originalname: string
    mimetype: string
  }
} & Record<string, unknown>

type UpdatePetBody = BodyWithFile & {
  name?: string
  species?: string
  gender?: "MALE" | "FEMALE"
  age?: number
  size?: "SMALL" | "MEDIUM" | "LARGE"
  description?: string | null
  status?: "AVAILABLE" | "ADOPTED" | "PENDING"
}

function hasFile(b: BodyWithFile): b is Required<BodyWithFile> {
  return Boolean(b.__file)
}

export class PetController {
  constructor(
    httpServer: HttpServer,
    createPet: CreatePet,
    tokenVerifier: AccessTokenVerifier,
    getPet: GetPet,
    getAllPets: GetAllPets,
    deletePet: DeletePet,
    updatePet: UpdatePet
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
          if (hasFile(body)) {
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

    httpServer.route(
      "delete",
      "/api/pets/:id",
      requireAuth(
        async (params: { id: string }, _body, _query, _headers, auth) => {
          const petId = params.id
          const ouput = await deletePet.execute(petId, auth.sub)
          return http.ok(ouput)
        }
      )
    )

    httpServer.route(
      "patch",
      "/api/pets/:id",
      requireAuth<{ id: string }, UpdatePetBody, Record<string, unknown>>(
        async (params, body, _q, _h, auth) => {
          const { id } = petIdSchema.parse(params)
          let photo: PhotoInput | null = null
          if (hasFile(body)) {
            photo = {
              buffer: body.__file.buffer,
              filename: body.__file.originalname,
              mimeType: body.__file.mimetype,
            }
          }
          const parsed = updatePetSchema.parse({
            name: body.name,
            species: body.species,
            gender: body.gender,
            age: body.age,
            size: body.size,
            description: body.description ?? undefined,
            status: body.status,
          })
          const output = await updatePet.execute({
            petId: id,
            requesterId: auth.sub,
            ...parsed,
            photo,
          })
          return http.ok(output)
        }
      ),
      { upload: { single: "photo" } }
    )
  }
}
