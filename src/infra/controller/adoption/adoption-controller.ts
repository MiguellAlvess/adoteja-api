import { HttpServer } from "../../http/http-server.js"
import { http } from "../../http/http.js"
import {
  makeRequireAuth,
  RouteParams,
  RouteQuery,
} from "../../http/require-auth.js"
import { AccessTokenVerifier } from "../../../application/ports/auth/access-token-verifier.js"
import { RequestAdoption } from "../../../application/usecase/adoption/request-adoption.js"
import {
  adoptionIdSchema,
  requestAdoptionSchema,
} from "../../http/schemas/adoption-schema.js"
import { GetAdoption } from "../../../application/usecase/adoption/get-adoption.js"
import { ApproveAdoption } from "../../../application/usecase/adoption/approve-adoption.js"
import { RejectAdoption } from "../../../application/usecase/adoption/reject-adoption.js"

export class AdoptionController {
  constructor(
    httpServer: HttpServer,
    tokenVerifier: AccessTokenVerifier,
    requestAdoption: RequestAdoption,
    getAdoption: GetAdoption,
    approveAdoption: ApproveAdoption,
    rejectAdoption: RejectAdoption
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

    httpServer.route(
      "patch",
      "/api/adoptions/:id/approve",
      requireAuth<RouteParams, unknown, RouteQuery>(
        async (params, _b, _q, _h, _auth) => {
          const output = await approveAdoption.execute(params.id)
          return http.ok(output)
        }
      )
    )

    httpServer.route(
      "patch",
      "/api/adoptions/:id/reject",
      requireAuth<RouteParams, unknown, RouteQuery>(
        async (params, _b, _q, _h, _auth) => {
          const output = await rejectAdoption.execute(params.id)
          return http.ok(output)
        }
      )
    )

    httpServer.route(
      "get",
      "/api/adoptions/:id",
      requireAuth<RouteParams, unknown, RouteQuery>(
        async (params, _b, _q, _h, _auth) => {
          const { id } = adoptionIdSchema.parse(params)
          const output = await getAdoption.execute(id)
          return http.ok(output)
        }
      )
    )
  }
}
