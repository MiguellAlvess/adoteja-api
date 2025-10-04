import { HttpServer } from "../../http/http-server.js"
import { http } from "../../http/http.js"
import {
  makeRequireAuth,
  RouteParams,
  RouteQuery,
} from "../../http/require-auth.js"
import { AccessTokenVerifier } from "../../../application/ports/auth/access-token-verifier.js"
import { RequestAdoption } from "../../../application/usecase/adoption/request-adoption.js"
import { requestAdoptionSchema } from "../../http/schemas/adoption-schema.js"

export class AdoptionController {
  constructor(
    httpServer: HttpServer,
    tokenVerifier: AccessTokenVerifier,
    requestAdoption: RequestAdoption
  ) {
    const requireAuth = makeRequireAuth(tokenVerifier)

    httpServer.route(
      "post",
      "/api/adoptions",
      requireAuth<RouteParams, unknown, RouteQuery>(
        async (_p, body, _q, _h, auth) => {
          const parsed = requestAdoptionSchema.parse(body)
          const output = await requestAdoption.execute({
            petId: parsed.petId,
            adopterId: auth.sub,
          })
          return http.created(output)
        }
      )
    )
  }
}
