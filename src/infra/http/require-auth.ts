import { IncomingHttpHeaders } from "http"
import { AccessTokenVerifier } from "../../application/ports/auth/access-token-verifier.js"
import { UnauthorizedError } from "../../application/errors/auth/index.js"

export type RouteParams = Record<string, string>
export type RouteQuery = Record<string, string | string[]>
export type RouteBody = unknown
export type Authed = { sub: string }
export type RouteHandler<P = RouteParams, B = RouteBody, Q = RouteQuery> = (
  params: P,
  body: B,
  query: Q,
  headers: IncomingHttpHeaders
) => Promise<unknown>

export type AuthedRouteHandler<
  P = RouteParams,
  B = RouteBody,
  Q = RouteQuery,
> = (
  params: P,
  body: B,
  query: Q,
  headers: IncomingHttpHeaders,
  auth: Authed
) => Promise<unknown>

export function makeRequireAuth(verifier: AccessTokenVerifier) {
  return function requireAuth<P = RouteParams, B = RouteBody, Q = RouteQuery>(
    handler: AuthedRouteHandler<P, B, Q>
  ): RouteHandler<P, B, Q> {
    return async (params, body, query, headers) => {
      const authHeader = headers?.authorization
      if (!authHeader?.startsWith("Bearer ")) throw new UnauthorizedError()
      const token = authHeader.slice(7)
      const { sub } = verifier.verify(token)
      return handler(params, body, query, headers, { sub })
    }
  }
}
